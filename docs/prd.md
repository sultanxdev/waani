# Waani V0 — Complete PRD

**Product:** Waani  
**Version:** V0 — Voice AI Agent MVP  
**Product type:** Developer-focused Voice AI platform  
**Primary goal:** Prove that developers can create an AI voice agent and connect it to a real Indian phone call.

> **V0 success = A developer can create an agent, attach an Indian phone number, call it, have a multi-turn Hindi/Hinglish conversation, and see the transcript and call details in the dashboard.**

---

# 1. Product Definition

### One-line definition

> **Waani is a developer platform that lets developers build AI-powered phone agents without building the underlying voice infrastructure themselves.**

V0 is **not** trying to compete with Vapi feature-for-feature.

V0 is proving the core loop:

```text
Phone Call
    ↓
Telephony
    ↓
Audio Streaming
    ↓
STT
    ↓
LLM
    ↓
TTS
    ↓
Audio
    ↓
Phone Call
```

---

# 2. Problem

Building a phone-based AI agent requires a developer to integrate several systems:

```text
Telephony
STT
LLM
TTS
WebSockets
Audio processing
Conversation state
Call management
```

A developer shouldn't need to build all of this independently.

Waani provides a single abstraction:

```text
Developer
    ↓
Waani
    ↓
AI Voice Agent
    ↓
Phone
```

---

# 3. V0 Target Users

## Primary user

**Developer / technical founder**

Example:

> "I want an AI receptionist for my SaaS."

They should be able to use Waani without understanding the internals of STT, TTS, audio streaming, or telephony.

---

## Example use cases

### Clinic

```text
Patient calls
 ↓
AI receptionist
 ↓
Appointment conversation
```

### Real estate

```text
Customer calls
 ↓
AI qualifies lead
 ↓
Collects requirements
```

### Recruitment

```text
Candidate calls
 ↓
AI asks screening questions
 ↓
Records answers
```

### Customer support

```text
Customer calls
 ↓
AI answers FAQ
```

**V0 does not need vertical-specific features.**

---

# 4. Goals

## Primary goals

V0 must:

1. Allow developers to create an AI agent.
    
2. Allow developers to configure its instructions.
    
3. Connect an Indian phone number.
    
4. Receive/make phone calls.
    
5. Stream call audio.
    
6. Convert speech to text.
    
7. Send text to an LLM.
    
8. Convert LLM response to speech.
    
9. Stream audio back to the caller.
    
10. Maintain multi-turn conversation state.
    
11. Store transcripts.
    
12. Show call history.
    
13. Show basic call metrics.
    
14. Provide API access.
    
15. Provide basic dashboard access.
    

---

# 5. Non-goals

Do **not** build these in V0:

```text
❌ Multi-agent systems
❌ AI model router
❌ Own STT model
❌ Own TTS model
❌ RAG
❌ Vector database
❌ Marketplace
❌ Billing
❌ Team management
❌ Advanced analytics
❌ A/B testing
❌ Prompt versioning
❌ Advanced evaluations
❌ Kubernetes
❌ Microservices
❌ RabbitMQ
❌ Kafka
```

This is intentional.

---

# 6. V0 Technology Stack

## Frontend

```text
Next.js
TypeScript
Tailwind CSS
```

Dashboard:

```text
Agents
Calls
Call details
Settings
API keys
```

---

## Backend

```text
Node.js
TypeScript
Fastify
```

Express is also acceptable, but I'd use **Fastify** for Waani because this is an API-heavy product.

---

## Database

```text
PostgreSQL
Prisma
```

---

## Realtime

```text
WebSocket
```

---

## Telephony

```text
Exotel
```

---

## STT

```text
Sarvam Saaras
```

---

## LLM

```text
OpenAI API
```

---

## TTS

```text
Sarvam Bulbul
```

---

## Deployment

```text
Frontend → Vercel
Backend  → Render / Railway / AWS
Database → PostgreSQL
```

For V0, don't over-engineer deployment.

---

# 7. High-Level Architecture

```text
                         Developer
                             │
                             ▼
                    ┌────────────────┐
                    │ Waani Dashboard│
                    └───────┬────────┘
                            │
                            ▼
                    ┌────────────────┐
                    │   Waani API    │
                    └───────┬────────┘
                            │
               ┌────────────┼────────────┐
               │            │            │
               ▼            ▼            ▼
            Agents        Calls       API Keys
               │            │
               └────────────┼────────────┘
                            │
                            ▼
                    ┌────────────────┐
                    │ Voice Runtime  │
                    └───────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
           Exotel        Sarvam        OpenAI
         Telephony         STT           LLM
              ▲                           │
              │                           ▼
              └────────── Sarvam TTS ─────┘
                            │
                            ▼
                          Caller
```

---

# 8. Voice Conversation Flow

## Outbound call

```text
Developer
   │
   │ POST /calls
   ▼
Waani API
   │
   │ Create call
   ▼
Exotel
   │
   │ Call customer
   ▼
Customer answers
   │
   ▼
Exotel WebSocket
   │
   ▼
Waani Voice Runtime
```

---

# 9. Real-Time Conversation

Once the call is connected:

```text
Customer speaks
       ↓
Audio chunk
       ↓
WebSocket
       ↓
Waani
       ↓
STT
       ↓
Transcript
       ↓
Conversation Manager
       ↓
OpenAI
       ↓
Response
       ↓
TTS
       ↓
Audio
       ↓
WebSocket
       ↓
Exotel
       ↓
Customer hears response
```

---

# 10. Multi-turn Conversation

Example:

### Turn 1

Customer:

> "Mujhe appointment chahiye."

Waani:

> "Bilkul. Kis doctor se appointment chahiye?"

---

### Turn 2

Customer:

> "Dr Sharma."

Waani:

> "Aapko kis din appointment chahiye?"

---

### Turn 3

Customer:

> "Kal."

Waani:

> "Kal 5 baje appointment available hai. Kya main book kar doon?"

The runtime needs to maintain:

```text
Turn 1
Turn 2
Turn 3
```

---

# 11. Agent

An agent is the central object of Waani.

An agent contains:

```text
name
instructions
language
voice
LLM configuration
```

Example:

```json
{
  "name": "Clinic Receptionist",
  "language": "hi-IN",
  "instructions": "You are a helpful clinic receptionist.",
  "voice": {
    "provider": "sarvam"
  },
  "llm": {
    "provider": "openai",
    "model": "gpt-5"
  }
}
```

---

# 12. Agent Requirements

An agent must have:

### Required

```text
name
instructions
language
```

### Optional

```text
voice
LLM model
temperature
greeting
```

---

# 13. Agent Default Configuration

If developer doesn't specify:

```text
language = hi-IN

STT = Sarvam

LLM = OpenAI

TTS = Sarvam
```

---

# 14. Agent API

## Create Agent

```http
POST /v1/agents
```

Request:

```json
{
  "name": "Clinic Receptionist",
  "instructions": "You are a helpful clinic receptionist.",
  "language": "hi-IN"
}
```

Response:

```json
{
  "id": "agent_01JABC",
  "name": "Clinic Receptionist",
  "language": "hi-IN",
  "status": "active",
  "createdAt": "2026-08-23T10:00:00Z"
}
```

---

# 15. List Agents

```http
GET /v1/agents
```

Response:

```json
{
  "data": [
    {
      "id": "agent_01JABC",
      "name": "Clinic Receptionist",
      "status": "active"
    }
  ]
}
```

---

# 16. Get Agent

```http
GET /v1/agents/:agentId
```

---

# 17. Update Agent

```http
PATCH /v1/agents/:agentId
```

Example:

```json
{
  "instructions": "You are a professional Hindi clinic receptionist."
}
```

---

# 18. Delete Agent

```http
DELETE /v1/agents/:agentId
```

---

# 19. Calls

A call represents one phone conversation.

Call states:

```text
created
   ↓
queued
   ↓
ringing
   ↓
answered
   ↓
connected
   ↓
in_progress
   ↓
completed
```

Failure states:

```text
failed
cancelled
no_answer
busy
```

---

# 20. Create Call

```http
POST /v1/calls
```

Request:

```json
{
  "agentId": "agent_01JABC",
  "to": "+919876543210"
}
```

Response:

```json
{
  "id": "call_01JXYZ",
  "status": "queued",
  "agentId": "agent_01JABC",
  "to": "+919876543210"
}
```

---

# 21. Get Call

```http
GET /v1/calls/:callId
```

Response:

```json
{
  "id": "call_01JXYZ",
  "status": "completed",
  "durationSeconds": 142,
  "startedAt": "2026-08-23T10:00:00Z",
  "endedAt": "2026-08-23T10:02:22Z"
}
```

---

# 22. List Calls

```http
GET /v1/calls
```

Support:

```text
limit
cursor
status
agentId
from
to
```

Example:

```http
GET /v1/calls?agentId=agent_123&status=completed&limit=20
```

---

# 23. End Call

```http
POST /v1/calls/:callId/end
```

---

# 24. Incoming Calls

Developer can assign a phone number to an agent.

Example:

```text
+91XXXXXXXXXX
        ↓
Waani
        ↓
Clinic Receptionist
```

Incoming flow:

```text
Caller
 ↓
Exotel
 ↓
Waani webhook
 ↓
Find phone number
 ↓
Find assigned agent
 ↓
Start voice session
```

---

# 25. Phone Number API

```http
GET /v1/phone-numbers
```

```http
POST /v1/phone-numbers
```

```http
GET /v1/phone-numbers/:id
```

```http
PATCH /v1/phone-numbers/:id
```

---

# 26. Phone Number Object

```json
{
  "id": "phone_123",
  "number": "+911234567890",
  "provider": "exotel",
  "agentId": "agent_123",
  "status": "active"
}
```

---

# 27. Telephony Webhooks

Waani needs internal endpoints such as:

```http
POST /webhooks/exotel/call
POST /webhooks/exotel/status
POST /webhooks/exotel/audio
```

These are **provider-facing endpoints**, not public developer APIs.

---

# 28. WebSocket Architecture

```text
                    Exotel
                       │
                       │ WebSocket
                       ▼
              ┌──────────────────┐
              │ Waani WS Gateway  │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Voice Session    │
              │ Manager          │
              └────────┬─────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
         STT          LLM          TTS
```

---

# 29. Voice Session

Each active call creates:

```text
VoiceSession
```

It contains:

```text
sessionId
callId
agentId
connection
state
conversation
audio state
```

Example:

```typescript
interface VoiceSession {
  id: string;
  callId: string;
  agentId: string;
  status: "active" | "ended";
}
```

---

# 30. Conversation State

Store:

```text
system prompt
user messages
assistant messages
```

Example:

```json
[
  {
    "role": "user",
    "content": "Mujhe appointment chahiye"
  },
  {
    "role": "assistant",
    "content": "Kis doctor se appointment chahiye?"
  }
]
```

---

# 31. STT Abstraction

Do not tightly couple your entire application to Sarvam.

Create:

```typescript
interface STTProvider {
  transcribe(
    audio: Buffer
  ): Promise<Transcript>;
}
```

Implementation:

```text
SarvamSTTProvider
```

Later:

```text
WhisperSTTProvider
```

---

# 32. LLM Abstraction

```typescript
interface LLMProvider {
  generate(
    request: LLMRequest
  ): Promise<LLMResponse>;
}
```

Implementation:

```text
OpenAIProvider
```

---

# 33. TTS Abstraction

```typescript
interface TTSProvider {
  synthesize(
    text: string
  ): Promise<Audio>;
}
```

Implementation:

```text
SarvamTTSProvider
```

This will save you from rewriting the entire system later.

---

# 34. Provider Architecture

```text
packages/providers/

├── stt/
│   ├── interface.ts
│   └── sarvam.ts
│
├── llm/
│   ├── interface.ts
│   └── openai.ts
│
├── tts/
│   ├── interface.ts
│   └── sarvam.ts
│
└── telephony/
    ├── interface.ts
    └── exotel.ts
```

---

# 35. Database

Use PostgreSQL.

## Users

```text
users
```

Fields:

```text
id
email
name
password_hash
created_at
updated_at
```

---

# 36. Organizations

Even if you're initially the only user, introduce organizations.

```text
organizations
```

Fields:

```text
id
name
created_at
```

Relationship:

```text
User
 ↓
Organization
```

This makes future multi-tenancy much easier.

---

# 37. API Keys

```text
api_keys
```

Fields:

```text
id
organization_id
name
key_hash
last_used_at
created_at
revoked_at
```

Never store the raw API key.

---

# 38. Agents

```text
agents
```

Fields:

```text
id
organization_id
name
instructions
language
llm_provider
llm_model
stt_provider
tts_provider
status
created_at
updated_at
```

---

# 39. Phone Numbers

```text
phone_numbers
```

Fields:

```text
id
organization_id
phone_number
provider
provider_id
agent_id
status
created_at
```

---

# 40. Calls

```text
calls
```

Fields:

```text
id
organization_id
agent_id
phone_number_id

direction
from_number
to_number

status

started_at
answered_at
ended_at

duration_seconds

created_at
```

Direction:

```text
inbound
outbound
```

---

# 41. Call Turns

```text
call_turns
```

Fields:

```text
id
call_id
sequence
speaker
text
started_at
ended_at
latency_ms
```

Speaker:

```text
user
assistant
```

---

# 42. Call Events

```text
call_events
```

Example:

```text
call.created
call.ringing
call.answered
call.connected
stt.started
stt.completed
llm.started
llm.completed
tts.started
tts.completed
call.ended
```

This will later become the foundation for observability.

---

# 43. Database relationship

```text
Organization
│
├── Users
│
├── API Keys
│
├── Agents
│
├── Phone Numbers
│
└── Calls
      │
      ├── Call Turns
      │
      └── Call Events
```

---

# 44. Authentication

Dashboard:

```text
Email
Password
```

API:

```http
Authorization: Bearer waani_live_xxxxx
```

Every API request resolves:

```text
API Key
 ↓
Organization
 ↓
Resource
```

---

# 45. Authorization

A developer should **never** be able to access another organization's:

```text
agents
calls
phone numbers
API keys
transcripts
```

Every query must be scoped by:

```text
organization_id
```

This is mandatory.

---

# 46. API Error Format

Use consistent errors.

```json
{
  "error": {
    "code": "AGENT_NOT_FOUND",
    "message": "Agent does not exist.",
    "requestId": "req_123"
  }
}
```

Common errors:

```text
UNAUTHORIZED
FORBIDDEN
VALIDATION_ERROR
AGENT_NOT_FOUND
CALL_NOT_FOUND
PHONE_NUMBER_NOT_FOUND
PROVIDER_ERROR
RATE_LIMITED
INTERNAL_ERROR
```

---

# 47. Request IDs

Every API request gets:

```text
X-Request-ID
```

Example:

```text
req_01JABC123
```

Include it in logs and error responses.

This becomes extremely useful when debugging production calls.

---

# 48. Logging

V0 needs basic structured logging.

Example:

```json
{
  "level": "info",
  "requestId": "req_123",
  "callId": "call_123",
  "event": "llm.completed",
  "latencyMs": 421
}
```

Don't log:

```text
API keys
passwords
sensitive credentials
```

Be careful with transcripts because voice data can contain personal information.

---

# 49. Dashboard

V0 dashboard should be deliberately small.

## Navigation

```text
Waani
│
├── Overview
├── Agents
├── Calls
├── Phone Numbers
└── API Keys
```

---

# 50. Overview

Display:

```text
Total Calls
Successful Calls
Average Call Duration
Total Minutes
```

Example:

```text
Today

Calls          42
Completed      38
Failed          4
Minutes       183
```

Don't build 30 analytics charts.

---

# 51. Agents Page

Display:

```text
Agent Name
Language
Status
Calls
Created
```

Buttons:

```text
Create Agent
Edit
Delete
```

---

# 52. Create Agent UI

Fields:

```text
Agent name
Instructions
Language
Voice
LLM
```

Example:

```text
Agent Name:
Clinic Receptionist

Language:
Hindi

Instructions:

You are a helpful clinic receptionist...
```

---

# 53. Calls Page

Table:

```text
Call ID
Agent
Phone
Direction
Status
Duration
Date
```

Clicking a call opens details.

---

# 54. Call Details

Show:

```text
Call status
Duration
From
To
Agent
Started
Ended
```

Then transcript:

```text
USER
Mujhe appointment chahiye.

AI
Bilkul. Kis doctor se appointment chahiye?

USER
Dr Sharma.
```

---

# 55. API Keys Page

Developer can:

```text
Create key
Revoke key
View key metadata
```

When creating:

```text
waani_live_xxxxxxxxx
```

Show the raw key **only once**.

---

# 56. Developer Experience

The user should be able to go from:

```text
Sign up
 ↓
Create agent
 ↓
Connect phone
 ↓
Call
```

in **less than 10 minutes**.

That is an important V0 success metric.

---

# 57. Developer Quick Start

Eventually documentation should show:

```typescript
import { Waani } from "@waani-ai/sdk";

const waani = new Waani({
  apiKey: process.env.WAANI_API_KEY
});

const agent = await waani.agents.create({
  name: "My Voice Agent",
  language: "hi-IN",
  instructions: `
    You are a helpful assistant.
  `
});

const call = await waani.calls.create({
  agentId: agent.id,
  to: "+919876543210"
});
```

---

# 58. V0 Security Requirements

Minimum:

```text
HTTPS
API key authentication
Password hashing
Organization isolation
Input validation
Rate limiting
Secret management
Secure WebSocket authentication
```

Never:

```text
store plaintext API keys
store plaintext passwords
expose provider credentials
```

---

# 59. Rate Limiting

Basic API rate limits:

```text
100 requests/minute/API key
```

Adjust later.

For expensive operations:

```text
calls.create
```

use stricter limits.

---

# 60. Timeouts

Every external API request must have a timeout.

For example:

```text
STT timeout
LLM timeout
TTS timeout
Exotel timeout
```

Don't let a provider hang indefinitely.

---

# 61. Retry Policy

V0:

Only retry **safe transient failures**.

Don't blindly retry an active voice interaction.

For example:

```text
provider HTTP 503
→ limited retry

invalid request
→ no retry
```

---

# 62. Failure Handling

If STT fails:

```text
STT failure
 ↓
log error
 ↓
ask user to repeat
```

If LLM fails:

```text
LLM failure
 ↓
fallback response
```

Example:

> "Sorry, I didn't catch that. Could you please repeat?"

If TTS fails:

```text
end gracefully
```

Don't leave the caller hanging.

---

# 63. Call Failure States

Track:

```text
no_answer
busy
rejected
provider_error
stt_error
llm_error
tts_error
network_error
completed
```

This will matter enormously when debugging.

---

# 64. Privacy

Because Waani handles voice conversations, design for privacy from V0.

Minimum:

```text
Don't expose transcripts publicly
Encrypt data in transit
Restrict dashboard access
Protect API keys
Define transcript retention
```

For production deployment, make sure your actual data handling, recording, consent, and telecom practices comply with applicable Indian laws and provider requirements.

---

# 65. V0 Metrics

Track these internally.

## Product metrics

```text
agents_created
calls_started
calls_completed
calls_failed
active_users
```

## Voice metrics

```text
average_call_duration
STT_latency
LLM_latency
TTS_latency
total_turns
```

## Reliability

```text
call_failure_rate
provider_error_rate
WebSocket_disconnect_rate
```

---

# 66. V0 Success Criteria

V0 is successful if:

### Technical

-  Agent can be created through API.
    
-  Agent can be created through dashboard.
    
-  Indian phone number can be connected.
    
-  Outbound call works.
    
-  Incoming call works.
    
-  Audio streams correctly.
    
-  STT works.
    
-  LLM responds.
    
-  TTS works.
    
-  Multi-turn conversation works.
    
-  Call state is persisted.
    
-  Transcript is stored.
    
-  Call history is visible.
    
-  API authentication works.
    
-  Organization isolation works.
    

---

# 67. V0 Demo Scenario

You should have one polished demo.

### Agent

```text
Clinic Receptionist
```

### System prompt

```text
You are a professional clinic receptionist.

Your responsibilities:
- greet callers
- understand their request
- answer basic clinic questions
- collect appointment information

Speak naturally in Hindi/Hinglish.

Keep responses concise.
```

### Conversation

```text
AI:
"Namaste, main clinic assistant hoon.
Main aapki kya madad kar sakti hoon?"

User:
"Mujhe kal appointment chahiye."

AI:
"Bilkul. Kis doctor se appointment chahiye?"

User:
"Dr Sharma."

AI:
"Dr Sharma ke saath kal 5 baje appointment
available hai. Kya main book kar doon?"
```

For V0, **you don't even need real appointment booking yet**.

The purpose is proving the voice infrastructure.

---

# 68. V0 Project Structure

I'd use:

```text
waani/
│
├── apps/
│   │
│   ├── api/
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── organizations/
│   │   │   │   ├── agents/
│   │   │   │   ├── calls/
│   │   │   │   ├── phone-numbers/
│   │   │   │   └── webhooks/
│   │   │   │
│   │   │   ├── voice/
│   │   │   │   ├── session-manager.ts
│   │   │   │   ├── conversation.ts
│   │   │   │   └── websocket.ts
│   │   │   │
│   │   │   ├── providers/
│   │   │   │   ├── stt/
│   │   │   │   ├── llm/
│   │   │   │   ├── tts/
│   │   │   │   └── telephony/
│   │   │   │
│   │   │   ├── middleware/
│   │   │   ├── config/
│   │   │   └── server.ts
│   │   │
│   │   └── package.json
│   │
│   └── dashboard/
│       ├── app/
│       ├── components/
│       └── package.json
│
├── packages/
│   ├── database/
│   ├── types/
│   └── sdk/
│
├── docs/
│
├── docker-compose.yml
├── package.json
└── README.md
```

---

# 69. V0 Development Milestones

## Milestone 1

**Backend foundation**

```text
Node
TypeScript
PostgreSQL
Prisma
Auth
API keys
```

---

## Milestone 2

**Agent management**

```text
Create
Read
Update
Delete
```

---

## Milestone 3

**Voice providers**

```text
Sarvam STT
OpenAI
Sarvam TTS
```

---

## Milestone 4

**Telephony**

```text
Exotel
incoming call
outgoing call
```

---

## Milestone 5

**Realtime runtime**

```text
WebSocket
audio
STT
LLM
TTS
```

---

## Milestone 6

**Conversation**

```text
multi-turn
state
transcript
```

---

## Milestone 7

**Dashboard**

```text
agents
calls
transcripts
phone numbers
```

---

## Milestone 8

**Hardening**

```text
timeouts
errors
logging
security
rate limits
```

---

# 70. V0 Definition of Done

You should **not call V0 complete** just because:

> "I connected OpenAI to Sarvam."

V0 is done when this entire flow works:

```text
                   ┌───────────────┐
                   │   Developer   │
                   └───────┬───────┘
                           │
                     Create Agent
                           │
                           ▼
                    ┌────────────┐
                    │   Waani    │
                    └─────┬──────┘
                          │
                     Phone Number
                          │
                          ▼
                       Caller
                          │
                    Real Phone Call
                          │
                          ▼
                      Exotel
                          │
                       WebSocket
                          │
                          ▼
                    Voice Runtime
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
            STT          LLM          TTS
             │            │            │
             └────────────┼────────────┘
                          │
                          ▼
                        Caller
                          │
                          ▼
                     Conversation
                          │
                          ▼
                      Transcript
                          │
                          ▼
                     Dashboard
```

---

# 71. V0 Timeline at 4 Hours/Day

### Week 1

```text
Backend
Database
Auth
API keys
Agents
```

### Week 2

```text
STT
LLM
TTS
WebSocket
```

### Week 3

```text
Exotel
Real phone call
Voice runtime
Conversation state
```

### Week 4

```text
Dashboard
Call history
Transcripts
Security
Error handling
Testing
Documentation
```

### Target

**4 weeks × ~28 hours/week = ~112 hours.**

That's a realistic target for you.

But don't interpret 112 hours as a guarantee. **Telephony/audio debugging can consume disproportionate time**, especially when provider documentation or streaming behavior doesn't match your assumptions.

---

# 72. What You Should Learn While Building

Don't stop coding to finish a giant course.

Learn each concept immediately before you need it:

```text
Need WebSocket?
→ Learn WebSocket.

Need audio streaming?
→ Learn PCM/chunks/sample rate.

Need STT?
→ Learn streaming transcription.

Need tool calling?
→ Learn structured outputs/function calling.

Need phone calls?
→ Learn Exotel/webhook/call lifecycle.

Need production reliability?
→ Learn timeout/retry/idempotency.
```

That's much faster.

---

# 73. The V0 Rule

There is one rule I strongly recommend:

> **If a feature doesn't help you complete a real phone conversation, it doesn't belong in V0.**

That rule will prevent you from spending two weeks building:

```text
beautiful dashboard
complex architecture
microservices
Redis
RabbitMQ
Kubernetes
advanced analytics
```

while the actual phone call doesn't work.

Your first real Waani milestone should be:

> **"I call my Waani number from my phone, speak in Hinglish, and the AI answers me naturally."**

Everything else comes after that.