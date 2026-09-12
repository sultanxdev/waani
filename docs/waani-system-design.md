# WAANI | SYSTEM DESIGN & ARCHITECTURE

## 1. Architecture Goal

Waani is a realtime voice-agent runtime exposed through a developer API. The architecture must keep the realtime media path fast while keeping durable call metadata, transcripts, configuration, and usage data reliable.

The system is intentionally a modular service architecture, not a large microservice fleet.

## 2. High-Level Architecture

```text
                         Developer
                            │
                     REST API / SDK
                            │
                            ▼
                    ┌────────────────┐
                    │    Waani API   │
                    │ Fastify        │
                    └───────┬────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
          Agents        Phone Numbers    API Keys
             │              │
             └──────────────┼──────────────┘
                            ▼
                    ┌────────────────┐
                    │ Voice Runtime  │
                    │ WebSocket      │
                    └───────┬────────┘
                            │
            ┌───────────────┼────────────────┐
            ▼               ▼                ▼
         Exotel          Sarvam           OpenAI
       Telephony           STT               LLM
                            ▲                │
                            │                ▼
                            └──────────── Sarvam TTS
                                    │
                                    ▼
                                  Caller
```

## 3. Runtime Separation

There are three important layers:

```text
VOICE RUNTIME
STT / LLM / TTS / audio / call state

DEVELOPER API
Agents / calls / tools / phone numbers / keys

OBSERVABILITY
Transcripts / traces / metrics / provider events
```

Voice runtime is the product. The API is the distribution surface. Observability is the debugging and production advantage.

## 4. Inbound Call Flow

```text
Caller
  ↓
Exotel
  ↓
Webhook / Call Event
  ↓
Resolve phone number
  ↓
Resolve agent
  ↓
Create call record
  ↓
Open WebSocket media session
  ↓
Voice Runtime
```

## 5. Outbound Call Flow

```text
Developer
  ↓
POST /v1/calls
  ↓
Validate API key
  ↓
Validate agent + target number
  ↓
Create call record
  ↓
Request Exotel call
  ↓
Customer answers
  ↓
Exotel WebSocket
  ↓
Voice Runtime
```

## 6. Realtime Conversation Flow

```text
Caller speaks
      ↓
Audio chunks
      ↓
WebSocket
      ↓
Audio/session manager
      ↓
Streaming STT
      ↓
Transcript event
      ↓
Conversation manager
      ↓
OpenAI
      ↓
Text response / tool call
      ↓
Sarvam TTS
      ↓
Audio chunks
      ↓
WebSocket
      ↓
Exotel
      ↓
Caller hears response
```

## 7. Barge-in

Barge-in is a core realtime behavior.

```text
TTS playing
   ↓
Caller starts speaking
   ↓
Voice activity detected
   ↓
Stop current TTS playback
   ↓
Flush pending audio
   ↓
Process new user turn
```

The runtime must not continue speaking over a new user turn.

## 8. Call State Machine

```text
CREATED
  ↓
RINGING
  ↓
CONNECTED
  ↓
LISTENING
  ↓
THINKING
  ↓
SPEAKING
  ├───────────────┐
  ↓               │
LISTENING         │
  ↓               │
TRANSFER_PENDING  │
  ↓               │
TRANSFERRED       │
                  │
ENDED <───────────┘
```

Failure states:

```text
FAILED
CANCELLED
```

Every state transition should emit a call event.

## 9. Conversation State

The active session maintains:

```text
callId
agentId
language
currentTurn
conversationMessages
pendingToolCall
currentAudioState
transferState
```

Realtime state can live in memory with Redis used for short-lived coordination or recovery metadata. PostgreSQL remains the durable source of truth for the completed call.

## 10. Tool Calling

A developer registers a tool:

```http
POST /v1/tools
```

Example:

```json
{
  "name": "checkOrderStatus",
  "description": "Check the customer's order status",
  "endpoint": "https://example.com/api/order"
}
```

Runtime flow:

```text
Caller
 ↓
STT
 ↓
LLM
 ↓
Tool Call
 ↓
Waani Tool Executor
 ↓
Developer Endpoint
 ↓
Tool Result
 ↓
LLM
 ↓
TTS
```

Tool requests must have:

- timeout
- response validation
- error handling
- request ID
- call ID
- tool call ID

## 11. Human Transfer

```text
AI
 ↓
transfer_to_human
 ↓
Waani
 ↓
Exotel
 ↓
Human
```

When transfer is accepted:

- stop AI generation
- stop TTS
- update call state
- connect the human destination
- record transfer event

## 12. Call Trace Model

Each call records immutable lifecycle events:

```text
call.started
call.connected
stt.started
stt.completed
llm.started
llm.completed
tool.called
tool.completed
tool.failed
tts.started
tts.completed
call.transferred
call.ended
call.failed
```

A call detail page reconstructs the complete sequence from these events.

## 13. Latency Model

Measure each stage:

```text
STT latency
LLM latency
Tool latency
TTS latency
Turn latency
```

Example:

```text
STT       180ms
LLM       420ms
Tool       80ms
TTS       290ms
----------------
Turn      970ms
```

These are measurements, not hardcoded claims.

## 14. Data Architecture

PostgreSQL stores durable application data:

```text
users
organizations
memberships
api_keys
agents
phone_numbers
calls
call_turns
call_events
tools
webhook_endpoints
usage_records
```

The organization is the ownership boundary for API credentials and resources. Team collaboration is not required for the first product release.

## 15. API Key Security

API keys use a format such as:

```text
waani_live_xxxxxxxxx
```

Store only a cryptographic hash of the secret. Display the raw key exactly once.

Use scopes where useful:

```text
agents:read
agents:write
calls:read
calls:write
tools:read
tools:write
```

## 16. WebSocket Architecture

Use the `ws` WebSocket implementation.

The media connection should be isolated from normal REST request latency.

```text
Exotel WebSocket
        ↓
Connection Handler
        ↓
Call Session
        ↓
Audio Buffer
        ↓
STT Stream
        ↓
Conversation Manager
        ↓
TTS Stream
        ↓
Audio Output
```

The connection handler must handle:

- disconnects
- malformed frames
- provider close events
- timeouts
- backpressure
- call termination

## 17. Provider Abstraction

Use internal adapters rather than hardcoding provider calls into the voice runtime:

```text
TelephonyProvider
  └── ExotelProvider

STTProvider
  └── SarvamProvider

LLMProvider
  └── OpenAIProvider

TTSProvider
  └── SarvamProvider
```

This allows provider replacement without rewriting the core conversation engine.

## 18. Error Handling

Realtime voice requires conservative failure handling.

Examples:

```text
STT timeout
→ retry only when safe; otherwise end/transfer gracefully

LLM timeout
→ fallback response or transfer

TTS failure
→ fallback voice/error path

Exotel disconnect
→ end call and persist failure

Tool timeout
→ return structured tool error to LLM
```

Do not blindly retry realtime operations because retries directly affect caller experience.

## 19. Observability

Use structured Pino logs.

Every operational event should carry:

```text
requestId
callId
agentId
provider
stage
event
latencyMs
errorCode
```

Do not log API keys, credentials, or raw transcripts by default.

## 20. Dashboard Architecture

Next.js renders:

```text
Overview
Agents
Calls
Phone Numbers
API Keys
Settings
```

Call detail page reads the durable call model and renders:

```text
Metadata
Transcript
Tool Calls
Lifecycle Events
Latency
Errors
Provider Information
```

## 21. Deployment

Recommended initial deployment:

```text
Vercel
  → Next.js dashboard

AWS / Render / Railway
  → Fastify API
  → Voice runtime

Managed PostgreSQL
  → Durable data

Redis
  → Realtime session coordination
```

Docker should be used for API/runtime reproducibility. Do not introduce Kubernetes for the first production deployment.

## 22. Technology Stack

```text
Frontend: Next.js + TypeScript + Tailwind CSS
API: Fastify + TypeScript + Zod
Database: PostgreSQL + Prisma
Realtime: WebSocket (ws)
Cache/coordination: Redis
Telephony: Exotel
STT: Sarvam Saaras
LLM: OpenAI API
TTS: Sarvam Bulbul
Logging: Pino
Testing: Vitest + Supertest
Docs: OpenAPI / Swagger
Containers: Docker
CI/CD: GitHub Actions
```

## 23. Engineering Rule

The most important milestone is not the dashboard.

> **A developer calls a real Waani number from a phone, speaks naturally in Hindi/Hinglish, Waani responds in realtime, executes a tool when needed, and stores a complete call trace.**

Everything else supports that path.

