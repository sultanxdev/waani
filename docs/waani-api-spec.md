# WAANI | API SPECIFICATION

**Base URL**

```text
https://api.waani.dev/v1
```

**Protocol:** HTTPS  
**Format:** JSON  
**Authentication:** Bearer API keys  
**Dashboard authentication:** JWT/session-based auth  
**Documentation:** OpenAPI / Swagger

## 1. Authentication

### Create API Key

```http
POST /v1/organizations/{orgId}/api-keys
Authorization: Bearer <admin-credential>
```

Request:

```json
{
  "name": "Production",
  "scopes": ["agents:read", "agents:write", "calls:read", "calls:write"]
}
```

Response:

```json
{
  "id": "key_123",
  "name": "Production",
  "key": "waani_live_xxxxxxxxx",
  "createdAt": "2026-09-10T10:00:00Z"
}
```

The raw key is returned once only.

### Revoke API Key

```http
DELETE /v1/organizations/{orgId}/api-keys/{keyId}
Authorization: Bearer <admin-credential>
```

---

# 2. Agents

## Create Agent

```http
POST /v1/agents
Authorization: Bearer waani_live_xxx
Content-Type: application/json
```

Request:

```json
{
  "name": "Order Support",
  "language": "hi-IN",
  "voice": "sarvam-default",
  "systemPrompt": "You are an order support agent. Speak naturally in Hindi/Hinglish."
}
```

Response:

```json
{
  "id": "agent_123",
  "name": "Order Support",
  "language": "hi-IN",
  "status": "active",
  "createdAt": "2026-09-10T10:00:00Z"
}
```

## List Agents

```http
GET /v1/agents
```

## Get Agent

```http
GET /v1/agents/{agentId}
```

## Update Agent

```http
PATCH /v1/agents/{agentId}
```

## Delete Agent

```http
DELETE /v1/agents/{agentId}
```

---

# 3. Phone Numbers

## Add / Connect Number

```http
POST /v1/phone-numbers
```

Request:

```json
{
  "provider": "exotel",
  "phoneNumber": "+91XXXXXXXXXX",
  "agentId": "agent_123"
}
```

## List Numbers

```http
GET /v1/phone-numbers
```

## Get Number

```http
GET /v1/phone-numbers/{id}
```

## Update Number

```http
PATCH /v1/phone-numbers/{id}
```

Example:

```json
{
  "agentId": "agent_456",
  "status": "active"
}
```

---

# 4. Calls

## Create Outbound Call

```http
POST /v1/calls
Idempotency-Key: call-request-123
```

Request:

```json
{
  "agentId": "agent_123",
  "to": "+91XXXXXXXXXX",
  "fromPhoneNumberId": "phone_123"
}
```

Response:

```json
{
  "id": "call_123",
  "status": "created",
  "direction": "outbound",
  "agentId": "agent_123",
  "createdAt": "2026-09-10T10:00:00Z"
}
```

## List Calls

```http
GET /v1/calls
```

Supported query parameters:

```text
agentId
phoneNumberId
status
direction
from
to
cursor
limit
```

## Get Call

```http
GET /v1/calls/{callId}
```

## End Call

```http
POST /v1/calls/{callId}/end
```

## Transfer Call

```http
POST /v1/calls/{callId}/transfer
```

Request:

```json
{
  "to": "+91XXXXXXXXXX",
  "reason": "customer_requested_human"
}
```

## Get Transcript

```http
GET /v1/calls/{callId}/transcript
```

Response:

```json
{
  "callId": "call_123",
  "turns": [
    {
      "speaker": "user",
      "text": "Mera order kahaan hai?",
      "startedAt": "2026-09-10T10:01:02Z"
    },
    {
      "speaker": "assistant",
      "text": "Order number bataiye.",
      "startedAt": "2026-09-10T10:01:04Z"
    }
  ]
}
```

---

# 5. Call Events

## List Events

```http
GET /v1/calls/{callId}/events
```

Example response:

```json
{
  "events": [
    {
      "type": "call.started",
      "timestamp": "2026-09-10T10:00:00Z"
    },
    {
      "type": "stt.completed",
      "latencyMs": 180,
      "timestamp": "2026-09-10T10:00:03Z"
    },
    {
      "type": "llm.completed",
      "latencyMs": 420,
      "timestamp": "2026-09-10T10:00:04Z"
    }
  ]
}
```

Event types:

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
stt.started
stt.completed
llm.started
llm.completed
tts.started
tts.completed
```

---

# 6. Tools

## Register Tool

```http
POST /v1/tools
```

Request:

```json
{
  "name": "checkOrderStatus",
  "description": "Check the customer's order status",
  "endpoint": "https://example.com/api/order",
  "timeoutMs": 3000
}
```

## List Tools

```http
GET /v1/tools
```

## Get Tool

```http
GET /v1/tools/{toolId}
```

## Update Tool

```http
PATCH /v1/tools/{toolId}
```

## Delete Tool

```http
DELETE /v1/tools/{toolId}
```

Tool invocation payload sent to the developer endpoint:

```json
{
  "callId": "call_123",
  "toolCallId": "tool_456",
  "agentId": "agent_123",
  "arguments": {
    "orderId": "ORD123"
  }
}
```

---

# 7. Developer Webhooks

## Register Endpoint

```http
POST /v1/webhooks
```

Request:

```json
{
  "url": "https://example.com/waani/webhook",
  "events": [
    "call.ended",
    "tool.completed",
    "call.failed"
  ]
}
```

## List Endpoints

```http
GET /v1/webhooks
```

## Update Endpoint

```http
PATCH /v1/webhooks/{webhookId}
```

## Delete Endpoint

```http
DELETE /v1/webhooks/{webhookId}
```

Waani should sign developer webhook requests so consumers can authenticate events.

Example headers:

```text
Waani-Signature: t=...,v1=...
Waani-Event-Id: evt_123
```

---

# 8. Exotel Webhooks

## Incoming Call

```http
POST /webhooks/exotel/call
```

## Call Status

```http
POST /webhooks/exotel/status
```

The handlers must:

1. Validate the provider request.
2. Resolve the phone number.
3. Resolve the agent.
4. Create/update the call record.
5. Emit a lifecycle event.
6. Return quickly.

---

# 9. Usage

## Get Usage Summary

```http
GET /v1/usage
```

Response:

```json
{
  "period": "2026-09",
  "calls": 42,
  "completedCalls": 38,
  "failedCalls": 4,
  "minutes": 183
}
```

## Get Call Usage

```http
GET /v1/calls/{callId}/usage
```

Response:

```json
{
  "durationSeconds": 151,
  "telephony": null,
  "stt": null,
  "llm": null,
  "tts": null
}
```

Provider cost fields remain nullable until exact billing integrations are implemented.

---

# 10. Health

```http
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

## Readiness

```http
GET /ready
```

Checks required dependencies.

---

# 11. Error Contract

Every API error:

```json
{
  "error": {
    "code": "CALL_NOT_FOUND",
    "message": "The requested call does not exist.",
    "requestId": "req_123"
  }
}
```

Standard codes:

```text
INVALID_REQUEST
AUTHENTICATION_FAILED
AUTHORIZATION_DENIED
NOT_FOUND
CONFLICT
RATE_LIMITED
INVALID_PHONE_NUMBER
PROVIDER_ERROR
CALL_NOT_READY
CALL_ALREADY_ENDED
TOOL_TIMEOUT
TOOL_FAILED
INTERNAL_ERROR
```

---

# 12. HTTP Status Codes

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

---

# 13. Idempotency

The following operations accept `Idempotency-Key`:

```text
POST /v1/calls
POST /v1/tools
POST /v1/webhooks
```

Call creation must not create multiple outbound calls when a client retries the same request.

---

# 14. SDK

The TypeScript SDK should wrap the public REST API.

Example:

```ts
import { Waani } from '@waani-ai/sdk';

const waani = new Waani({
  apiKey: process.env.WAANI_API_KEY!,
});

const agent = await waani.agents.create({
  name: 'Order Support',
  language: 'hi-IN',
  systemPrompt: 'You are an order support agent.',
});

const call = await waani.calls.create({
  agentId: agent.id,
  to: '+91XXXXXXXXXX',
});

console.log(call.id);
```

The SDK should initially be a thin, type-safe wrapper over the API.

---

# 15. API Documentation

Publish generated OpenAPI documentation at:

```text
/docs
```

The contract is versioned under `/v1` and must remain backward-compatible within the version.

