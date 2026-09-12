# WAANI | SOFTWARE REQUIREMENTS SPECIFICATION

## 1. Purpose

This SRS converts the Waani product definition into testable engineering requirements for a developer-focused voice AI runtime.

## 2. Actors

| Actor | Responsibility |
|---|---|
| Developer | Creates agents, numbers, tools and calls |
| Customer application | Uses Waani APIs and receives webhook events |
| Dashboard user | Configures agents and inspects calls |
| Voice runtime | Handles realtime audio and conversation state |
| Telephony provider | Connects phone calls and media |
| STT provider | Converts speech to text |
| LLM provider | Generates responses and tool calls |
| TTS provider | Converts text to speech |
| Database | Stores authoritative application state |

## 3. Functional Requirements

### SRS-001 Authentication

The API shall reject requests without a valid active API credential.

### SRS-002 Authorization

Protected resources shall enforce organization/resource scope and API-key scopes.

### SRS-003 Agent Management

The system shall allow authorized developers to create, read, update and delete agents.

### SRS-004 Agent Configuration

An agent shall support at minimum:

- name
- system instructions
- language
- voice
- LLM configuration

### SRS-005 Phone Number Management

The system shall allow a phone number to be connected to an agent and expose connection status.

### SRS-006 Inbound Calls

An inbound call to a connected Waani number shall resolve to the configured agent and create a durable call record.

### SRS-007 Outbound Calls

An authorized developer shall be able to initiate an outbound call through the API.

### SRS-008 Realtime Audio

The system shall establish a realtime media session and stream audio between the telephony provider and Waani.

### SRS-009 Streaming STT

The runtime shall pass caller audio to the configured STT provider and receive incremental or completed transcription events.

### SRS-010 LLM Processing

The runtime shall provide the relevant conversation context to the configured LLM and process the resulting text/tool decision.

### SRS-011 Streaming TTS

The runtime shall convert agent responses into audio and stream the response back to the caller.

### SRS-012 Conversation State

The runtime shall preserve multi-turn conversation context for the duration of the call.

### SRS-013 Turn Detection

The runtime shall detect user turns and avoid treating partial/noisy audio as complete user requests where provider signals support this.

### SRS-014 Barge-in

If a caller begins speaking while TTS is playing, Waani shall stop or interrupt the current output and process the new turn.

### SRS-015 Tool Registration

Developers shall be able to register HTTP tools with name, description, endpoint, and timeout configuration.

### SRS-016 Tool Invocation

The runtime shall execute a requested tool through the registered endpoint and return the structured result to the LLM.

### SRS-017 Tool Timeout

Tool calls shall have an enforced timeout and shall not block the call indefinitely.

### SRS-018 Tool Failure Handling

A failed tool call shall produce a structured failure result and an observable event.

### SRS-019 Human Transfer

The runtime shall support transfer of an active call to a configured human destination.

### SRS-020 Transfer State

Once transfer begins, Waani shall stop normal AI generation and record transfer lifecycle events.

### SRS-021 Call Transcript

The system shall persist call turns with speaker, text, and timestamps.

### SRS-022 Call Lifecycle Events

The system shall emit structured lifecycle events including at minimum:

```text
call.started
call.connected
call.ended
call.failed
transcript.created
tool.called
tool.completed
tool.failed
call.transferred
```

### SRS-023 Call Trace

The system shall preserve enough lifecycle data to reconstruct the sequence of major runtime operations for a call.

### SRS-024 Latency Metrics

The system shall record STT, LLM, tool, TTS, and turn latency where measurable.

### SRS-025 Usage Metering

The system shall record call count, duration and total minutes per organization/account.

### SRS-026 Developer Webhooks

The system shall deliver configured events to registered developer endpoints.

### SRS-027 Webhook Signing

Developer webhook deliveries shall use a documented signature mechanism.

### SRS-028 API Idempotency

Outbound call creation shall support an idempotency key so client retries do not create duplicate calls.

### SRS-029 API Stability

All `/v1` responses shall conform to documented schemas.

### SRS-030 Health Checks

The system shall expose liveness and readiness endpoints.

## 4. Realtime Requirements

### SRS-031 Connection Failure

A telephony/WebSocket disconnect shall transition the call to a controlled terminal state and persist the failure.

### SRS-032 Backpressure

The realtime audio pipeline shall prevent unbounded buffering when downstream providers slow down.

### SRS-033 Session Isolation

Audio and state from one active call shall never be mixed with another call.

### SRS-034 Audio Format

The runtime shall validate and normalize the telephony provider's expected audio format before sending data to STT/TTS components.

### SRS-035 Provider Correlation

Provider call IDs and Waani call IDs shall be stored together for debugging.

## 5. Dashboard Requirements

### SRS-036 Overview

The dashboard shall show total calls, successful calls, failed calls, total minutes, and average duration.

### SRS-037 Agents

Users shall be able to list, create, edit, and delete agents.

### SRS-038 Calls

Users shall be able to search/filter calls and open call details.

### SRS-039 Call Details

Call details shall show metadata, transcript, tool calls, lifecycle events, latency, and failure information where available.

### SRS-040 Phone Numbers

Users shall see connected numbers and associated agent/status.

### SRS-041 API Keys

Users shall create and revoke keys. The raw secret shall not be retrievable after creation.

## 6. Security Requirements

### SRS-042 API Key Storage

API secrets shall be stored as secure hashes rather than plaintext.

### SRS-043 Secret Exposure

Credentials, tokens, and API keys shall not appear in logs, traces, or normal API responses.

### SRS-044 Transcript Protection

Raw transcript data shall not be written to application logs by default.

### SRS-045 Input Validation

All public API request bodies, query parameters, and tool definitions shall be validated.

### SRS-046 Rate Limiting

Public API endpoints shall enforce reasonable rate limits.

### SRS-047 Webhook Verification

Telephony/provider webhook requests shall be validated according to provider requirements.

### SRS-048 Authorization

A credential shall not access agents, calls, tools, or phone numbers outside its authorized scope.

## 7. Reliability Requirements

### SRS-049 Durable Call Record

A call record shall be created before dependent dashboard reads can be considered authoritative.

### SRS-050 Event Appendability

Call events shall be persisted so the call timeline remains reconstructable after runtime failures.

### SRS-051 Failure Classification

The runtime shall distinguish provider failures, tool failures, validation failures, and caller/call termination conditions.

### SRS-052 Safe Failure

If the LLM, STT, or TTS provider becomes unavailable, the system shall fail gracefully by using a safe response, terminating the call, or transferring to a human where configured.

### SRS-053 Retry Discipline

Retries shall be used cautiously on realtime operations; retries must not create duplicate caller-visible actions.

## 8. Performance Requirements

### SRS-054 API Latency

Normal control-plane API requests should target p95 latency below 500 ms under expected development workloads.

### SRS-055 Realtime Turn Latency

The system shall measure end-to-end turn latency and all major components contributing to it.

### SRS-056 WebSocket Responsiveness

The runtime shall avoid blocking the audio loop on dashboard/database operations that are not required to continue the conversation.

## 9. Observability Requirements

### SRS-057 Structured Logging

Logs shall be structured JSON and include identifiers such as:

```text
requestId
callId
agentId
provider
event
latencyMs
errorCode
```

### SRS-058 Error Tracking

Unhandled application errors shall be captured by the configured error-tracking system.

### SRS-059 Trace Completeness

A completed call shall contain enough events to understand the major runtime path.

## 10. Data Requirements

Core entities:

```text
User
Organization
Membership
ApiKey
Agent
PhoneNumber
Call
CallTurn
CallEvent
Tool
WebhookEndpoint
UsageRecord
```

## 11. Testing Requirements

### SRS-060 Unit Tests

Unit coverage shall include:

- agent configuration validation
- call state transitions
- tool validation
- API authorization
- usage calculations

### SRS-061 Integration Tests

Integration coverage shall include:

- PostgreSQL persistence
- API authentication
- Exotel webhook handlers
- tool execution
- call lifecycle persistence
- webhook delivery

### SRS-062 Realtime Tests

Test at minimum:

- connect/disconnect
- malformed audio/frame handling
- turn transitions
- barge-in
- provider failures
- call termination

### SRS-063 End-to-End Test

The system shall support an end-to-end automated or controlled test covering:

```text
API
 ↓
Create Agent
 ↓
Create/attach number
 ↓
Initiate call
 ↓
Voice runtime
 ↓
STT
 ↓
LLM
 ↓
TTS
 ↓
Call end
 ↓
Transcript + trace
```

## 12. Acceptance Criteria

Waani is accepted for an external developer pilot when all of the following are demonstrated:

```text
[ ] Developer can authenticate
[ ] Developer can create agent
[ ] Agent can be configured
[ ] Phone number can be connected
[ ] Inbound call works
[ ] Outbound call works
[ ] Audio streams both directions
[ ] STT works
[ ] LLM works
[ ] TTS works
[ ] Multi-turn conversation works
[ ] Barge-in works
[ ] Tool call works
[ ] Human transfer works
[ ] Transcript is stored
[ ] Call events are stored
[ ] Call trace is visible
[ ] Latency is measured
[ ] API keys are protected
[ ] Developer webhooks work
[ ] Dashboard shows calls
[ ] SDK can create an agent and call
[ ] Errors are observable
```

## 13. Explicit Non-Requirements

The initial product does not require:

```text
Custom STT
Custom TTS
Custom LLM
RAG
Vector database
WhatsApp
SMS
CRM
Marketplace
Multi-agent orchestration
Advanced model routing
A/B testing
Complex billing
Mobile app
Kubernetes
Kafka
RabbitMQ
Large microservice fleet
```

The system should use existing voice/AI providers and concentrate engineering effort on the realtime runtime, developer API, call trace, and reliability. The source Waani plan explicitly recommends using Exotel + Sarvam + OpenAI initially rather than owning speech models prematurely. 

