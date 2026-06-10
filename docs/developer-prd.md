# CliniqAI — Developer PRD

**Product Name:** CliniqAI  
**Tagline:** AI receptionist and automation platform for aesthetic clinics  
**Target Markets:** UAE, India, GCC  
**Status:** MVP Phase  
**Last Updated:** June 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [API Specifications](#api-specifications)
6. [Integrations](#integrations)
7. [Deployment & Infrastructure](#deployment--infrastructure)
8. [Performance & Scaling](#performance--scaling)
9. [Security & Compliance](#security--compliance)
10. [Development Roadmap](#development-roadmap)

---

## Overview

CliniqAI is a multi-tenant SaaS platform providing AI-powered receptionist services for aesthetic and dermatology clinics via WhatsApp and voice calls. The platform handles patient inquiries, appointment booking, and clinic management while respecting clinic staff override and control.

**Core Functions:**
- 24/7 WhatsApp AI receptionist
- Inbound voice call handling with transcription
- Appointment booking and management
- Patient CRM and history tracking
- Automated reminders and follow-up
- Analytics and performance dashboard

---

## Tech Stack

### Frontend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js (App Router) | 15+ | Full-stack React framework with SSR/SSG |
| **Language** | TypeScript | 5.3+ | Type-safe development |
| **Styling** | Tailwind CSS | 3.3+ | Utility-first CSS framework |
| **UI Components** | shadcn/ui | Latest | Accessible, unstyled React components |
| **State Management** | TanStack Query (React Query) | 5+ | Server state caching and synchronization |
| **Forms** | React Hook Form + Zod | Latest | Type-safe form handling with validation |
| **Charts & Analytics** | Recharts | 2.10+ | React charting library for dashboards |
| **Real-time Updates** | Socket.io Client | 4.5+ | Real-time WebSocket communication |
| **PDF Generation** | react-pdf | Latest | Client-side PDF rendering for receipts/documents |

### Backend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Node.js + Express | 20 LTS | Runtime and HTTP server |
| **Language** | TypeScript | 5.3+ | Type-safe backend code |
| **ORM** | Prisma | 5.10+ | Type-safe database access |
| **API** | REST + Real-time Websockets | — | RESTful APIs + Socket.io for live updates |
| **Authentication** | NextAuth.js v5 | 5+ | OAuth 2.0, JWT, session management |
| **Validation** | Zod | Latest | Runtime type validation |
| **Logging** | Pino | 8.7+ | Structured JSON logging |
| **Error Tracking** | Sentry | Latest | Real-time error monitoring |

### AI/LLM

| Component | Service | Cost Model | Purpose |
|-----------|---------|-----------|---------|
| **LLM** | OpenAI GPT-4o-mini | Pay-per-token (~$0.00015/1K tokens input) | WhatsApp conversation responses |
| **LLM Backup** | Claude 3.5 Haiku (Anthropic) | Pay-per-token (~$0.00080/1K tokens input) | Fallback LLM for resilience |
| **Speech-to-Text** | Deepgram | $0.0043/min | Real-time transcription for voice calls |
| **Text-to-Speech** | ElevenLabs | $0.0003/char | Natural voice synthesis for voice responses |
| **Embedding** | OpenAI text-embedding-3-small | $0.02/1M tokens | Vector embeddings for semantic search |

### Database

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Primary DB** | PostgreSQL | 15+ | Relational data store (clinics, patients, conversations) |
| **Cache Layer** | Redis | 7.0+ | Session caching, queue state, real-time data |
| **Job Queue** | BullMQ | 5+ | Async job processing (AI responses, reminders) |
| **Search/Vector** | pgvector + PostgreSQL | Latest | Vector similarity search for knowledge base |
| **File Storage** | AWS S3 | Latest | Document storage (consent forms, recordings) |

### DevOps & Infrastructure

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Containerization** | Docker | 24+ | Container images and runtime |
| **Orchestration** | AWS ECS Fargate | Latest | Container orchestration (Phase 2) |
| **IaC** | Terraform | 1.6+ | Infrastructure as code for AWS resources |
| **CI/CD** | GitHub Actions | Latest | Automated build, test, deploy pipeline |
| **Container Registry** | AWS ECR | Latest | Private Docker image repository |
| **Monitoring** | Datadog (Phase 2) | Latest | APM and infrastructure monitoring |
| **Log Aggregation** | CloudWatch Logs + Datadog | Latest | Centralized logging |

### Third-Party Integrations

| Service | Purpose | Integration Type |
|---------|---------|------------------|
| **WhatsApp Business API** | Patient inbound/outbound messaging | 360dialog or direct Meta API (webhook) |
| **Twilio** | Inbound voice call handling + Programmable Voice | Webhook + WebSocket |
| **Meta Ads Library** | Prospect prospecting (identifying clinics running ads) | REST API |
| **Google Calendar** | Clinic calendar sync (Phase 2) | OAuth 2.0 + REST API |
| **Stripe** | Payment processing (Phase 2) | REST API + webhooks |
| **Sentry** | Error and performance monitoring | REST API + SDK |
| **Vercel** | Frontend hosting and deployment | Git integration |
| **AWS** | Infrastructure (EC2, RDS, S3, CloudFront, etc.) | AWS SDK + Terraform |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Package Manager** | pnpm | 8.15+ | Fast, space-efficient package management |
| **Bundler** | Webpack (Next.js built-in) | Latest | Code bundling and optimization |
| **Testing Framework** | Vitest + Jest | Latest | Unit and integration testing |
| **E2E Testing** | Playwright | Latest | Browser automation and E2E tests |
| **Linting** | ESLint | 8.50+ | Code quality and style enforcement |
| **Formatting** | Prettier | 3.0+ | Code formatting consistency |
| **Type Checking** | TypeScript | 5.3+ | Static type analysis |
| **Git Hooks** | husky + lint-staged | Latest | Pre-commit code quality checks |
| **Version Control** | Git (GitHub) | Latest | Source code management |
| **Documentation** | Markdown + Mintlify (Phase 2) | Latest | API and system documentation |

---

## Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Next.js Frontend (Vercel)                                       │
│  - Dashboard (React)                                             │
│  - Patient Portal (React)                                        │
│  - Real-time updates (Socket.io)                                │
└──────────────┬──────────────────────────────┬────────────────────┘
               │                              │
      ┌────────▼─────────┐         ┌──────────▼──────────┐
      │  API Layer       │         │  WebSocket Layer    │
      │  (REST + Express)│         │  (Socket.io)        │
      │  - Auth          │         │  - Live conversations
      │  - CRUD ops      │         │  - Real-time updates
      │  - Webhooks      │         └──────────┬──────────┘
      └────────┬─────────┘                    │
               │                              │
      ┌────────▼──────────────────────────────▼───────────┐
      │         Service Layer (Business Logic)             │
      ├───────────────────────────────────────────────────┤
      │  - WhatsApp AI Engine                             │
      │  - Voice AI Engine                                │
      │  - Appointment Service                            │
      │  - Patient Service                                │
      │  - Analytics Service                              │
      └────────┬──────────────────────────────┬───────────┘
               │                              │
      ┌────────▼─────────┐         ┌──────────▼──────────┐
      │  Queue Layer     │         │  LLM Layer          │
      │  (BullMQ + Redis)│         │  - OpenAI GPT-4o   │
      │  - AI responses  │         │  - Claude 3.5      │
      │  - Reminders     │         │  - Embeddings      │
      │  - Follow-ups    │         │  - Vector search   │
      └────────┬─────────┘         └──────────┬──────────┘
               │                              │
      ┌────────▼──────────────────────────────▼───────────┐
      │         Data Layer (Persistence)                   │
      ├───────────────────────────────────────────────────┤
      │  - PostgreSQL (clinics, patients, conversations)  │
      │  - Redis (cache, sessions, queue state)           │
      │  - S3 (documents, recordings, backups)            │
      │  - pgvector (semantic search)                     │
      └───────────────────────────────────────────────────┘
```

### Request Flow: WhatsApp Inquiry

```
1. Patient sends WhatsApp message
   └─> Meta sends webhook to /webhooks/whatsapp

2. Webhook handler validates signature
   └─> Extracts: sender, message body, timestamp, media

3. Find or create patient record
   └─> Look up by phone, create if new

4. Save inbound message to conversations table
   └─> conversation_id, message_id, timestamp, status

5. Enqueue BullMQ job: "whatsapp-ai-response"
   └─> Return 200 immediately (never block webhook)

6. Job processor (background worker):
   a. Fetch tenant knowledge base from cache
   b. Fetch patient history (past treatments, preferences)
   c. Fetch available appointment slots (next 7 days)
   d. Build context object
   e. Call OpenAI GPT-4o-mini with system prompt
   f. Parse response for intents (BOOKING, HANDOFF, INFO)
   g. If BOOKING intent: call booking engine
   h. If HANDOFF intent: flag conversation, notify staff
   i. Send response via WhatsApp Business API
   j. Save outbound message to DB
   k. Update lead status + conversion metrics

7. Dashboard updates in real-time
   └─> Staff sees new conversation, can take over
```

### Request Flow: Inbound Voice Call

```
1. Patient calls clinic number (Twilio)
   └─> Twilio webhook to /webhooks/voice/inbound

2. Return TwiML response with Connect verb pointing to WebSocket URL

3. Establish WebSocket connection to Node.js server
   └─> Start streaming audio bidirectionally

4. Audio stream processor:
   a. Receive audio frames from Twilio
   b. Send to Deepgram for real-time transcription
   c. Every utterance finalized → send to OpenAI
   d. OpenAI returns intent + response
   e. Response text → ElevenLabs TTS
   f. Stream audio back through Twilio

5. Call ends
   └─> Save full transcript to call_logs table
   └─> Optionally send follow-up WhatsApp or SMS

6. Analytics: track call duration, intent, handoff rate
```

### Job Queue Architecture (BullMQ + Redis)

```
Queue: whatsapp-ai-response
├─ Priority: High
├─ Max retries: 3
├─ Timeout: 30 seconds
├─ Concurrency: 10 jobs parallel
└─ Processor: processWhatsAppResponse()

Queue: voice-ai-response
├─ Priority: Critical (real-time)
├─ Max retries: 1
├─ Timeout: 500ms (must be fast)
├─ Concurrency: 5 jobs parallel
└─ Processor: processVoiceChunk()

Queue: appointment-reminders
├─ Priority: Normal
├─ Scheduled: every hour
├─ Processor: sendAppointmentReminders()
└─ Looks for appointments in next 24 hours

Queue: lead-followup
├─ Priority: Low
├─ Scheduled: daily at 10 AM
├─ Processor: followUpAbandonedLeads()
└─ Re-engages leads that didn't book

Queue: analytics-aggregation
├─ Priority: Low
├─ Scheduled: hourly
├─ Processor: aggregateMetrics()
└─ Computes summary stats for dashboard
```

---

## Database Schema

### Core Tables

```sql
-- Tenants (Clinics)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  country VARCHAR(2),
  language VARCHAR(5) DEFAULT 'en',
  
  -- WhatsApp Business Number
  whatsapp_business_id VARCHAR(255),
  whatsapp_phone_number_id VARCHAR(255),
  whatsapp_access_token VARCHAR(500),
  whatsapp_webhook_verify_token VARCHAR(255),
  
  -- Twilio Voice
  twilio_account_sid VARCHAR(255),
  twilio_auth_token VARCHAR(255),
  twilio_phone_number VARCHAR(20),
  
  -- Integration flags
  has_voice_enabled BOOLEAN DEFAULT FALSE,
  has_document_management BOOLEAN DEFAULT FALSE,
  has_calendar_sync BOOLEAN DEFAULT FALSE,
  
  -- Subscription
  plan VARCHAR(50) DEFAULT 'growth',
  billing_cycle_start DATE,
  monthly_quota_conversations INT DEFAULT 2000,
  monthly_quota_voice_minutes INT DEFAULT 500,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  CONSTRAINT valid_plan CHECK (plan IN ('starter', 'growth', 'premium'))
);

-- Clinic details (extended)
CREATE TABLE clinic_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Clinic info
  address TEXT,
  hours_of_operation JSONB, -- { "monday": "09:00-18:00", "tuesday": "09:00-18:00", ... }
  services JSONB, -- [ { "name": "Botox", "price": 800, "duration_min": 30 }, ... ]
  specialties TEXT[], -- [ 'Botox', 'Fillers', 'Laser', 'Microneedling' ]
  number_of_doctors INT,
  
  -- Knowledge base
  clinic_bio TEXT,
  faq JSONB, -- [ { "question": "...", "answer": "..." }, ... ]
  policies JSONB, -- cancellation, rescheduling, no-show policies
  
  -- Branding
  logo_url TEXT,
  primary_color VARCHAR(7), -- hex color
  secondary_color VARCHAR(7),
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(tenant_id)
);

-- Patients
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  phone_number VARCHAR(20) NOT NULL,
  whatsapp_id VARCHAR(255), -- from Meta webhook
  name VARCHAR(255),
  email VARCHAR(255),
  date_of_birth DATE,
  
  -- Patient preferences
  language VARCHAR(5) DEFAULT 'en',
  preferred_treatment_types TEXT[],
  
  -- Metadata
  first_contact_date TIMESTAMP,
  last_contact_date TIMESTAMP,
  total_conversations INT DEFAULT 0,
  total_appointments INT DEFAULT 0,
  lifetime_value DECIMAL(10, 2) DEFAULT 0.00,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  CONSTRAINT unique_patient_per_tenant UNIQUE(tenant_id, phone_number)
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  
  channel VARCHAR(20), -- 'whatsapp', 'voice', 'sms'
  initial_message TEXT,
  
  status VARCHAR(50) DEFAULT 'open',
  -- 'open', 'awaiting_response', 'booked', 'completed', 'abandoned'
  
  ai_intent VARCHAR(50), -- 'inquiry', 'booking_request', 'complaint', 'followup'
  handoff_required BOOLEAN DEFAULT FALSE,
  handoff_to_staff TIMESTAMP,
  
  ai_summary TEXT,
  customer_satisfaction INT, -- 1-5 rating
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  INDEX idx_tenant_status (tenant_id, status),
  INDEX idx_patient_created (patient_id, created_at DESC)
);

-- Messages (individual)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  
  sender VARCHAR(50), -- 'patient', 'ai_assistant', 'staff'
  sender_id VARCHAR(255), -- phone number or staff user ID
  
  message_text TEXT,
  media_url TEXT, -- images, videos
  media_type VARCHAR(20), -- 'image', 'video', 'document'
  
  external_message_id VARCHAR(255), -- WhatsApp message ID
  
  processing_status VARCHAR(50) DEFAULT 'pending',
  -- 'pending', 'processed', 'failed', 'handoff'
  
  ai_processing_time_ms INT,
  response_time_ms INT, -- time to send response
  
  created_at TIMESTAMP DEFAULT now(),
  
  INDEX idx_conversation_created (conversation_id, created_at DESC)
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id),
  
  doctor_name VARCHAR(255),
  treatment VARCHAR(255),
  price DECIMAL(10, 2),
  
  scheduled_date TIMESTAMP NOT NULL,
  duration_minutes INT DEFAULT 30,
  status VARCHAR(50) DEFAULT 'confirmed',
  -- 'pending_confirmation', 'confirmed', 'completed', 'no_show', 'cancelled'
  
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  INDEX idx_tenant_scheduled (tenant_id, scheduled_date),
  INDEX idx_patient_scheduled (patient_id, scheduled_date)
);

-- Knowledge Base (FAQ, Pricing, Policies)
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  category VARCHAR(50), -- 'pricing', 'procedure', 'policy', 'faq'
  question VARCHAR(500),
  answer TEXT,
  
  -- Embedding for semantic search
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  
  updated_at TIMESTAMP DEFAULT now(),
  
  INDEX idx_tenant_category (tenant_id, category),
  INDEX idx_embedding (embedding) USING IVFFLAT (lists=100)
);

-- Scheduled Messages (Reminders, Follow-ups)
CREATE TABLE scheduled_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id),
  appointment_id UUID REFERENCES appointments(id),
  
  message_type VARCHAR(50), -- 'reminder_24h', 'reminder_1h', 'followup', 'reengagement'
  message_text TEXT,
  
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  -- 'pending', 'sent', 'failed', 'cancelled'
  
  created_at TIMESTAMP DEFAULT now()
);

-- Voice Calls
CREATE TABLE voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  patient_id UUID REFERENCES patients(id),
  
  twilio_call_sid VARCHAR(255),
  inbound_number VARCHAR(20),
  outbound_number VARCHAR(20),
  
  duration_seconds INT,
  transcript TEXT,
  
  ai_intent VARCHAR(50),
  sentiment VARCHAR(50), -- 'positive', 'neutral', 'negative'
  
  recording_url TEXT,
  
  created_at TIMESTAMP DEFAULT now()
);

-- Analytics (pre-aggregated for performance)
CREATE TABLE daily_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  total_messages_inbound INT DEFAULT 0,
  total_messages_outbound INT DEFAULT 0,
  
  total_voice_calls INT DEFAULT 0,
  total_voice_minutes INT DEFAULT 0,
  
  new_patients INT DEFAULT 0,
  total_appointments_booked INT DEFAULT 0,
  total_appointments_completed INT DEFAULT 0,
  no_shows INT DEFAULT 0,
  
  ai_handoff_count INT DEFAULT 0,
  avg_response_time_ms INT,
  
  created_at TIMESTAMP DEFAULT now(),
  
  CONSTRAINT unique_tenant_date UNIQUE(tenant_id, date),
  INDEX idx_tenant_date (tenant_id, date DESC)
);

-- Staff Users
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50), -- 'owner', 'manager', 'receptionist', 'doctor'
  
  hashed_password VARCHAR(255),
  
  permissions JSONB, -- what can this user do?
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  CONSTRAINT unique_staff_email UNIQUE(tenant_id, email)
);

-- Authentication Sessions
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## API Specifications

### Authentication Endpoints

```
POST /api/auth/register
  Request: { email, password, clinic_name, country }
  Response: { user_id, tenant_id, api_key }

POST /api/auth/login
  Request: { email, password }
  Response: { session_token, expires_at }

POST /api/auth/logout
  Response: { status: "success" }

GET /api/auth/me
  Response: { user_id, tenant_id, clinic_name, plan }
```

### WhatsApp Integration Endpoints

```
POST /webhooks/whatsapp
  Validation: HMAC-SHA256 signature verification
  Payload: {
    entry: [{
      changes: [{
        value: {
          messages: [{
            from: "+971...",
            id: "wamid...",
            timestamp: "1234567890",
            text: { body: "How much is filler?" }
          }]
        }
      }]
    }]
  }
  Response: { status: "received" }

GET /api/conversations/:conversation_id
  Response: {
    id, patient_id, channel, status, ai_summary,
    messages: [ { id, sender, text, timestamp } ]
  }

POST /api/conversations/:conversation_id/handoff
  Request: { staff_message: "I'm taking over" }
  Response: { status: "handoff_initiated" }

POST /api/messages/:message_id/resend
  Response: { status: "resending" }
```

### Appointment Endpoints

```
GET /api/appointments
  Query: ?date_from=2026-06-01&date_to=2026-06-30&status=confirmed
  Response: {
    appointments: [
      {
        id, patient_id, patient_name, treatment,
        scheduled_date, status, notes
      }
    ]
  }

POST /api/appointments
  Request: {
    patient_id, doctor_name, treatment, scheduled_date,
    duration_minutes, price
  }
  Response: { id, status: "confirmed" }

PUT /api/appointments/:appointment_id
  Request: { status, notes }
  Response: { updated appointment }

POST /api/appointments/:appointment_id/send-reminder
  Response: { status: "reminder_sent" }
```

### Patient Endpoints

```
GET /api/patients?search=name
  Response: {
    patients: [
      {
        id, name, phone_number, first_contact_date,
        total_conversations, total_appointments, lifetime_value
      }
    ]
  }

GET /api/patients/:patient_id
  Response: {
    id, name, phone_number, email,
    conversation_history: [ { id, date, summary } ],
    appointments: [ {...} ],
    treatment_preferences: [...]
  }

PUT /api/patients/:patient_id
  Request: { name, email, preferred_treatments }
  Response: { updated patient }
```

### Knowledge Base Endpoints

```
GET /api/knowledge-base?category=pricing
  Response: {
    items: [
      { id, question, answer, category }
    ]
  }

POST /api/knowledge-base
  Request: { category, question, answer }
  Response: { id, embedding_generated: true }

PUT /api/knowledge-base/:item_id
  Request: { question, answer }
  Response: { updated item }

DELETE /api/knowledge-base/:item_id
  Response: { status: "deleted" }

POST /api/knowledge-base/regenerate-embeddings
  Response: { status: "regenerating", items_count: 42 }
```

### Analytics Endpoints

```
GET /api/analytics/dashboard
  Query: ?date_from=2026-06-01&date_to=2026-06-30
  Response: {
    summary: {
      total_messages: 1200,
      total_appointments_booked: 34,
      conversation_to_booking_rate: 0.45,
      avg_response_time_ms: 2400,
      ai_handoff_rate: 0.12
    },
    daily_breakdown: [
      { date: "2026-06-01", messages: 40, appointments_booked: 2 }
    ],
    top_intents: [ { intent, count, percentage } ]
  }

GET /api/analytics/conversations
  Query: ?status=booked&limit=100&offset=0
  Response: {
    conversations: [ {...} ],
    total_count: 245
  }
```

### Settings Endpoints

```
GET /api/settings/clinic
  Response: {
    name, address, hours_of_operation, services,
    logo_url, primary_color, secondary_color
  }

PUT /api/settings/clinic
  Request: { name, address, hours_of_operation, services, ... }
  Response: { updated clinic profile }

GET /api/settings/integrations
  Response: {
    whatsapp: { connected: true, phone_number: "+971..." },
    twilio: { connected: true, phone_number: "+971..." },
    google_calendar: { connected: false }
  }

POST /api/settings/integrations/whatsapp/test
  Response: { status: "webhook_received", timestamp }
```

---

## Integrations

### WhatsApp Business API Integration

**Provider:** 360dialog (recommended for MVP)  
**Costs:** €49/month flat + message costs ($0.046/message in UAE marketing tier, $0.013/message in service tier)

**Setup:**
1. Sign up at 360dialog.com
2. Get sandbox number for testing
3. Request production number (requires business verification)
4. Receive API key and webhook URL
5. Configure webhook URL in CliniqAI settings

**Implementation:**
```typescript
// libs/whatsapp.ts
export const sendWhatsAppMessage = async (
  phoneNumberId: string,
  accessToken: string,
  to: string,
  message: string,
  mediaUrl?: string
) => {
  const url = `https://waba.360dialog.io/v1/messages`;
  
  const payload = mediaUrl
    ? {
        messaging_product: "whatsapp",
        to,
        type: "image",
        image: { link: mediaUrl }
      }
    : {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message }
      };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "D360-API-KEY": accessToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return response.json();
};
```

### Twilio Voice Integration

**Provider:** Twilio Programmable Voice  
**Costs:** ~$0.013/minute inbound, ~$0.02/minute outbound  

**Setup:**
1. Create Twilio account
2. Buy phone number for each clinic
3. Configure webhook URL in Twilio console
4. Set up TwiML application

**Implementation:**
```typescript
// api/webhooks/voice/inbound.ts
export const handleInboundCall = async (req: Request) => {
  const { Caller, CallSid } = req.body;

  // Return TwiML to establish WebSocket connection
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Connect>
        <Stream url="wss://${process.env.APP_DOMAIN}/stream/${CallSid}" />
      </Connect>
    </Response>`;

  return new Response(twiml, {
    headers: { "Content-Type": "application/xml" }
  });
};
```

### Deepgram Speech-to-Text

**Provider:** Deepgram  
**Costs:** ~$0.0043/minute  

**Setup:**
1. Sign up at deepgram.com
2. Create API key
3. Use WebSocket API for real-time transcription

**Implementation:**
```typescript
// libs/deepgram.ts
export const setupDeepgramStream = (apiKey: string) => {
  const url = `wss://api.deepgram.com/v1/listen?project_id=${projectId}`;
  
  const ws = new WebSocket(url, ["token", apiKey]);
  
  ws.on("message", (data) => {
    const result = JSON.parse(data);
    if (result.is_final) {
      const transcript = result.channel.alternatives[0].transcript;
      return transcript;
    }
  });

  return ws;
};
```

### ElevenLabs Text-to-Speech

**Provider:** ElevenLabs  
**Costs:** ~$0.0003/character  

**Setup:**
1. Sign up at elevenlabs.io
2. Create API key
3. Choose voice (e.g., "Rachel")

**Implementation:**
```typescript
// libs/elevenlabs.ts
export const synthesizeVoice = async (
  text: string,
  voiceId: string,
  apiKey: string
) => {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    }
  );

  return response.arrayBuffer(); // Audio data
};
```

---

## Deployment & Infrastructure

### Phase 1: MVP Deployment (0–50 customers)

**AWS Architecture:**

```
┌─────────────────────────────────────┐
│         Route 53 (DNS)              │
│    cliniqai.app → CloudFront        │
└──────────────┬──────────────────────┘
               │
    ┌──────────▼──────────┐
    │   CloudFront (CDN)  │
    │  - Static assets    │
    │  - API caching      │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────────────┐
    │  Application Load Balancer   │
    │  (Single zone: ap-south-1a)  │
    └──────────┬───────────────────┘
               │
    ┌──────────▼──────────────────────────────┐
    │  EC2 t3.medium (1 instance)              │
    │  - Node.js API Server (Express)          │
    │  - BullMQ Worker (same process)          │
    │  - 30GB EBS gp3 root volume              │
    └──────────┬───────────────────────────────┘
               │
    ┌──────────┼─────────────┐
    │          │             │
┌───▼────┐ ┌──▼────┐ ┌──────▼──────┐
│ PostgreSQL
│ db.t3.micro
│ 20GB SSD
│ 5 GB backup
└────────┘ 

│ Redis
│ cache.t3.micro
│ 0.5GB
└────────┘ 

│ S3
│ Documents
│ Recordings
│ Backups
└───────────┘
```

**Terraform Setup:**
```hcl
# terraform/main.tf
provider "aws" {
  region = "ap-south-1"
}

# Security group
resource "aws_security_group" "app_sg" {
  name = "cliniqai-app-sg"
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 Instance
resource "aws_instance" "app" {
  ami             = "ami-0c55b159cbfafe1f0"
  instance_type   = "t3.medium"
  security_groups = [aws_security_group.app_sg.name]
  
  root_block_device {
    volume_type = "gp3"
    volume_size = 30
  }
  
  tags = {
    Name = "cliniqai-app"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier             = "cliniqai-db"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  storage_encrypted      = true
  skip_final_snapshot    = false
  
  db_name  = "cliniqai"
  username = "admin"
  password = var.db_password
  
  backup_retention_period = 7
  publicly_accessible     = false
  
  tags = {
    Name = "cliniqai-db"
  }
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id       = "cliniqai-redis"
  engine           = "redis"
  node_type        = "cache.t3.micro"
  num_cache_nodes  = 1
  parameter_group_name = "default.redis7"
  port             = 6379
  
  tags = {
    Name = "cliniqai-redis"
  }
}

# S3 Bucket
resource "aws_s3_bucket" "documents" {
  bucket = "cliniqai-documents-${var.env}"
  
  versioning {
    enabled = true
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "cleanup" {
  bucket = aws_s3_bucket.documents.id
  
  rule {
    id     = "delete-old-versions"
    status = "Enabled"
    
    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}
```

**Deployment with GitHub Actions:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run linter
        run: pnpm lint
      
      - name: Run tests
        run: pnpm test
      
      - name: Build
        run: pnpm build
      
      - name: Deploy to EC2
        env:
          EC2_HOST: ${{ secrets.EC2_HOST }}
          EC2_USER: ${{ secrets.EC2_USER }}
          EC2_KEY: ${{ secrets.EC2_PRIVATE_KEY }}
        run: |
          mkdir -p ~/.ssh
          echo "$EC2_KEY" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh -i ~/.ssh/id_rsa $EC2_USER@$EC2_HOST "cd /app && git pull && pnpm install && pnpm build && systemctl restart cliniqai"
```

### Phase 2: Scaling (50–200 customers)

- Switch to AWS ECS Fargate for auto-scaling
- Add RDS read replica
- Move to Redis cluster mode
- Implement CloudFront distribution with WAF
- Set up Datadog monitoring

### Phase 3: Production (200+ customers)

- Multi-AZ RDS with auto-failover
- Global CloudFront distribution (edge caching)
- Separate services: API, Workers, Webhooks (microservices)
- Kubernetes (EKS) for orchestration
- Dedicated DynamoDB for high-throughput queries

---

## Performance & Scaling

### Performance Targets

| Metric | Target | Tool |
|--------|--------|------|
| API response time (p95) | < 500ms | CloudWatch APM |
| AI response time | < 5 seconds | Sentry |
| WhatsApp message delivery | < 2 seconds | Internal logging |
| Voice call latency | < 1 second | Twilio metrics |
| Dashboard load time | < 2 seconds | Lighthouse CI |
| Database query p99 | < 100ms | CloudWatch |

### Caching Strategy

```typescript
// middleware/cache.ts
const cacheConfig = {
  // Static assets (Frontend)
  "/": { maxAge: 3600, sMaxAge: 86400 }, // 1h browser, 1d CDN
  "/*.html": { maxAge: 0, sMaxAge: 3600 }, // 1h CDN only
  "/_next/static": { maxAge: 31536000 }, // 1 year (immutable)
  
  // API responses
  "/api/appointments": { maxAge: 300, sMaxAge: 600 }, // 5min browser, 10min CDN
  "/api/knowledge-base": { maxAge: 3600, sMaxAge: 86400 }, // 1 day CDN
  "/api/analytics": { maxAge: 0, sMaxAge: 3600 }, // Real-time but CDN 1h
  "/api/patients": { maxAge: 0 } // No caching (user-specific)
};
```

### Database Query Optimization

```typescript
// queries are optimized with:
// 1. Proper indexes on tenant_id, patient_id, created_at
// 2. Pagination (cursor-based for large datasets)
// 3. Denormalization in daily_analytics table
// 4. View materialization for complex queries

// Example: Get clinic's daily metrics
CREATE VIEW clinic_daily_summary AS
SELECT
  date,
  tenant_id,
  SUM(total_messages_inbound) as messages,
  COUNT(DISTINCT patient_id) as new_patients,
  SUM(total_appointments_booked) as appointments
FROM daily_analytics
GROUP BY tenant_id, date;
```

### Queue Prioritization (BullMQ)

```typescript
// processQueue.ts
const queues = {
  // Priority 1: Real-time user actions
  whatsapp_ai_response: { priority: 1, maxConcurrency: 10, timeout: 30000 },
  voice_ai_response: { priority: 1, maxConcurrency: 5, timeout: 500 },
  
  // Priority 2: Time-sensitive business logic
  appointment_reminders: { priority: 2, maxConcurrency: 5, timeout: 10000 },
  
  // Priority 3: Background tasks
  lead_followup: { priority: 3, maxConcurrency: 3, timeout: 60000 },
  analytics_aggregation: { priority: 3, maxConcurrency: 1, timeout: 120000 }
};
```

### Load Testing Plan

```bash
# Using k6 for load testing
k6 run tests/load-test.js

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100
    { duration: '2m', target: 200 }, // Ramp to 200
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 }    // Ramp down
  ]
};
```

---

## Security & Compliance

### Authentication & Authorization

```typescript
// middleware/auth.ts
export const authMiddleware = async (req: Request) => {
  const token = req.headers.get("Authorization")?.split(" ")[1];
  
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.tenantId = decoded.tenant_id;
  } catch (err) {
    return new Response("Invalid token", { status: 401 });
  }
};

// Tenant isolation
export const checkTenantAccess = (req: Request) => {
  const requestedTenantId = req.params.tenant_id;
  
  if (req.tenantId !== requestedTenantId) {
    return new Response("Forbidden", { status: 403 });
  }
};
```

### Data Encryption

- **In Transit:** TLS 1.3 for all connections
- **At Rest:** AWS S3 SSE-S3, RDS encryption
- **Database:** PostgreSQL pgcrypto for sensitive fields (patient names, phone numbers)
- **Secrets:** AWS Secrets Manager for API keys, database passwords

### Compliance & Privacy

```typescript
// compliance/gdpr.ts
export const deletePatientData = async (tenantId: string, patientId: string) => {
  // GDPR right to be forgotten
  // 1. Anonymize patient record
  // 2. Delete all messages mentioning patient
  // 3. Keep appointment records for accounting (legal hold)
  // 4. Delete from analytics
  
  await db.patient.update({
    where: { id: patientId },
    data: {
      name: null,
      email: null,
      phone_number: `[deleted-${generateRandomId()}]`,
      deleted_at: new Date()
    }
  });
};

// CCPA: Allow data export
export const exportPatientData = async (tenantId: string, patientId: string) => {
  const patient = await db.patient.findUnique({ where: { id: patientId } });
  const conversations = await db.conversation.findMany({
    where: { patient_id: patientId },
    include: { messages: true }
  });
  
  return JSON.stringify({ patient, conversations }, null, 2);
};
```

### API Security

```typescript
// Rate limiting per tenant
const rateLimitConfig = {
  whatsapp_webhook: { limit: 100, window: 60 }, // 100 req/min
  voice_webhook: { limit: 50, window: 60 },
  api_general: { limit: 1000, window: 3600 }, // 1000 req/hour
  auth_endpoints: { limit: 5, window: 900 } // 5 attempts per 15 mins
};

// CORS
const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS?.split(","),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// CSP (Content Security Policy)
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' api.openai.com waba.360dialog.io;
`;
```

### Webhook Validation

```typescript
// middleware/webhookSignature.ts
export const validateWhatsAppSignature = (req: Request) => {
  const signature = req.headers.get("x-hub-signature-256");
  const body = req.rawBody; // Raw request body
  
  const hash = `sha256=${createHmac("sha256", process.env.WHATSAPP_WEBHOOK_SECRET)
    .update(body)
    .digest("hex")}`;
  
  if (!timingSafeEqual(signature, hash)) {
    return new Response("Invalid signature", { status: 403 });
  }
};
```

---

## Development Roadmap

### Sprint 1: MVP (Weeks 1–2)

**Features:**
- Basic WhatsApp message ingestion
- AI response generation (GPT-4o-mini)
- Simple dashboard
- Manual appointment booking

**Infrastructure:**
- Next.js + Express setup
- PostgreSQL + Redis
- AWS EC2 deployment
- Basic error logging

### Sprint 2: Production Ready (Weeks 3–4)

**Features:**
- WhatsApp booking flow
- Appointment reminders
- Patient CRM
- Dashboard with analytics

**Infrastructure:**
- Sentry integration
- CloudFront CDN
- Load testing

### Sprint 3: Scale (Weeks 5–8)

**Features:**
- Voice AI (Twilio + Deepgram)
- Multi-location support
- Arabic language support
- Google Calendar sync

**Infrastructure:**
- ECS Fargate preparation
- RDS read replica
- Advanced monitoring

### Sprint 4: Monetization (Weeks 9–12)

**Features:**
- Stripe billing
- Usage tracking
- Invoice generation
- Plan upgrades

**Infrastructure:**
- Terraform automation
- CI/CD hardening
- Disaster recovery plan

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// __tests__/services/ai.test.ts
describe("AI Service", () => {
  it("should build system prompt with clinic knowledge base", () => {
    const prompt = buildSystemPrompt(mockClinic, mockKB);
    expect(prompt).toContain(mockClinic.name);
    expect(prompt).toContain(mockKB[0].question);
  });

  it("should detect booking intent", () => {
    const response = { intent: "booking", details: {...} };
    expect(response.intent).toBe("booking");
  });
});
```

### Integration Tests (Vitest + Playwright)

```typescript
// __tests__/api/whatsapp.integration.ts
describe("WhatsApp API", () => {
  it("should receive message and send AI response", async () => {
    const response = await fetch("/webhooks/whatsapp", {
      method: "POST",
      body: mockWhatsAppWebhook
    });
    expect(response.status).toBe(200);
    
    // Check message was saved
    const message = await db.message.findFirst({
      where: { conversation_id: mockConversationId }
    });
    expect(message).toBeDefined();
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/clinic-dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('clinic owner can view and manage conversations', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'clinic@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button:has-text("Login")');
  
  await expect(page).toHaveURL('/dashboard');
  
  // Check conversations are visible
  const conversations = await page.locator('[data-testid="conversation"]');
  expect(await conversations.count()).toBeGreaterThan(0);
});
```

---

## Monitoring & Observability

### Key Metrics to Track

```
Business Metrics:
- MRR (Monthly Recurring Revenue)
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (LTV)
- Churn Rate
- Conversation-to-Booking Rate
- Average Revenue Per User (ARPU)

Technical Metrics:
- API response time (p50, p95, p99)
- Error rate (per endpoint)
- Database query time
- Queue depth and processing time
- WhatsApp webhook delivery time
- AI response accuracy (manual review)

Operational Metrics:
- Uptime percentage
- Error budget remaining
- Deployment frequency
- Lead time for changes
```

### Alerting

```yaml
# Alert when AI response time > 5 seconds
Alert: "AIResponseTimeHigh"
Threshold: p99 > 5000ms
Duration: 5 minutes
Action: PagerDuty notification + Slack alert

# Alert when WhatsApp webhook failure rate > 1%
Alert: "WhatsAppWebhookFailures"
Threshold: error_rate > 0.01
Duration: 10 minutes
Action: Auto-retry + Sentry + Slack

# Alert when database connections > 80 of 100
Alert: "DatabaseConnectionPoolHigh"
Threshold: connection_count > 80
Duration: Immediate
Action: Slack + increase pool size if trending
```

---

## Definitions & Glossary

| Term | Definition |
|------|-----------|
| **Tenant** | A clinic account using CliniqAI |
| **Conversation** | A continuous chat session between a patient and AI/staff |
| **Handoff** | When AI hands over to human staff (manually or auto-triggered) |
| **Knowledge Base** | Customized FAQ, pricing, and policies for a clinic |
| **Intent** | The action detected from patient message (inquiry, booking, complaint) |
| **Embedding** | Vector representation of text for semantic similarity search |
| **BullMQ** | Job queue library for async task processing |
| **Webhook** | HTTP callback for external services (Meta, Twilio) |

---

*Document Version: 1.0*  
*Last Updated: June 2026*  
*Author: Developer Team*
