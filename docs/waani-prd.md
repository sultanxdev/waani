# WAANI | PRODUCT REQUIREMENTS DOCUMENT

**Product:** Waani  
**Product Type:** Developer-focused voice AI platform  
**Positioning:** Production voice-agent runtime for developers  
**Primary Channel:** Phone calls  
**Initial Market:** India  
**Initial Languages:** Hindi, Hinglish, English  
**Primary Telephony Provider:** Exotel  
**STT:** Sarvam Saaras  
**LLM:** gemni ai 
**TTS:** Sarvam Bulbul

## 1. Product Definition

> **Waani lets developers build and deploy AI phone agents without building the underlying telephony, audio streaming, speech, conversation, and call infrastructure themselves.**

The developer should think about the agent's job. Waani handles how the voice conversation works. The core loop is Phone → Telephony → Audio Streaming → STT → LLM → TTS → Phone.

## 2. Problem

Building a production voice agent requires integrating telephony, audio streaming, STT, LLMs, TTS, WebSockets, turn detection, barge-in, conversation state, call management, webhooks, debugging, latency measurement, and provider failures.

Most developers should not have to build and maintain this entire runtime for every application.

## 3. Target Users

### Primary

- Technical founders
- Full-stack developers
- AI engineers
- AI startups

### Initial use cases

- AI receptionist
- AI sales agent
- AI support agent
- Appointment agent
- Recruitment screening
- Lead qualification

Waani is horizontal at the platform layer; vertical business logic belongs in the customer's application.

## 4. Core User Journey

```text
Sign up
  ↓
Create API key
  ↓
Create agent
  ↓
Configure instructions / language / voice
  ↓
Connect Indian phone number
  ↓
Make or receive call
  ↓
Realtime voice conversation
  ↓
Optional tool call
  ↓
Optional human transfer
  ↓
Call ends
  ↓
Transcript + call trace + metrics
```

A developer should be able to reach the first real call quickly. The source target is less than 10 minutes from signup to first call.

## 5. Core Features

### Agent

- Create, read, update, delete agents
- Configure name
- System instructions
- Language
- Voice
- LLM configuration
- Call behavior

### Phone Numbers

- Connect Exotel number
- Assign number to an agent
- Inbound routing
- Outbound calling
- Connection status

### Voice Runtime

- Realtime audio streaming
- Streaming STT
- LLM response generation
- Streaming TTS
- Multi-turn conversation state
- Turn detection
- Barge-in
- Call lifecycle handling

### Tools

Developers can register HTTP tools that Waani can invoke during a call.

Example:

```text
Caller
  ↓
LLM
  ↓
checkOrderStatus()
  ↓
Developer webhook
  ↓
Result
  ↓
LLM
  ↓
TTS
```

### Human Transfer

Transfer the active call to a configured human phone number when:

- the customer asks for a person
- the agent cannot complete the task
- a business rule requires escalation
- a sensitive situation occurs

### Developer Webhooks

Emit structured events for call lifecycle and tool execution.

### Call History

Store:

- call ID
- agent
- phone numbers
- direction
- status
- duration
- language
- timestamps
- transcript
- tool calls
- failure reason

### Call Trace

For each call, capture the execution path:

```text
Call started
  ↓
Audio connected
  ↓
STT started/completed
  ↓
LLM started/completed
  ↓
Tool called/completed
  ↓
TTS started/completed
  ↓
Audio delivered
```

The trace is the primary debugging and observability feature.

### Usage Tracking

Track:

- call count
- completed calls
- failed calls
- total duration
- billable minutes
- per-call provider usage metadata

## 6. Dashboard

Keep the dashboard small:

```text
Overview
Agents
Calls
Phone Numbers
API Keys
Settings
```

### Overview

- Total calls
- Successful calls
- Failed calls
- Total minutes
- Average duration

### Agents

- Agent name
- Language
- Status
- Calls
- Created date

### Calls

- Call ID
- Agent
- Phone
- Direction
- Status
- Duration
- Date

### Call Details

Show transcript, tool calls, lifecycle events, latency, provider metadata, and errors.

### API Keys

Create and revoke keys. Show the full key only once at creation time.

## 7. Language Support

Initial language support:

- Hindi
- Hinglish
- English

The agent should support code-switching where the configured model/provider can handle it.

## 8. Product Safety Boundaries

Waani is infrastructure, not a business application.

Do not build into the platform:

- RAG
- CRM
- WhatsApp
- SMS
- custom STT
- custom TTS
- custom LLM training
- marketplace
- multi-agent orchestration
- advanced model routing
- advanced analytics
- A/B testing
- enterprise SSO
- mobile application

## 9. Product Success Criteria

The core product is successful when an external developer can:

1. Create an agent.
2. Attach an Indian phone number.
3. Make or receive a real call.
4. Have a natural multi-turn Hindi/Hinglish/English conversation.
5. Execute an external tool during the call.
6. Transfer to a human when required.
7. See the transcript and call trace afterward.
8. Access the same capabilities through the API/SDK.

## 10. Technical Constraints

- PostgreSQL is the durable source of truth.
- Redis is for short-lived realtime/session coordination, not authoritative call history.
- WebSocket connections must not depend on dashboard availability.
- A failed provider call must produce a controlled failure state.
- API keys must be hashed and never returned after creation.
- Transcripts must not be written to logs by default.
- The runtime must avoid blocking on nonessential dashboard operations.

## 11. Commercial Model

Waani is usage-based infrastructure.

The eventual billing unit should primarily be voice minutes, with platform/feature pricing layered on top when justified.

Track provider cost components separately:

```text
Telephony
+ STT
+ LLM
+ TTS
= Call Cost
```

Do not build complex billing before usage metering and actual customer demand exist.

## 12. Definition of Done

Waani is ready for an external developer pilot when:

- real inbound and outbound calls work
- streaming STT/LLM/TTS works
- barge-in works
- conversation state works
- tool calling works
- human transfer works
- transcripts are persisted
- call traces are visible
- API keys are secure
- webhooks are delivered
- latency is measured
- failures are observable
- SDK examples work
- documentation is complete

