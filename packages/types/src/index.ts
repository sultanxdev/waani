export type CallStatus =
  | 'created'
  | 'queued'
  | 'ringing'
  | 'answered'
  | 'connected'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'no_answer'
  | 'busy'
  | 'cancelled';

export type CallDirection = 'inbound' | 'outbound';

export type SpeakerRole = 'user' | 'assistant' | 'system';

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationDTO {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKeyDTO {
  id: string;
  organizationId: string;
  name: string;
  keyPrefix: string;
  lastUsedAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
}

export interface CreateApiKeyResponse {
  apiKey: ApiKeyDTO;
  rawKey: string; // Shown only once upon creation
}

export interface AgentDTO {
  id: string;
  organizationId: string;
  name: string;
  instructions: string;
  language: string; // e.g. "hi-IN", "en-IN", "hinglish"
  greeting?: string | null;
  llmProvider: string; // "gemini" | "openai"
  llmModel: string; // "gemini-2.5-flash", "gpt-4o", etc.
  sttProvider: string; // "sarvam"
  ttsProvider: string; // "sarvam"
  voiceId?: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentDTO {
  name: string;
  instructions: string;
  language?: string;
  greeting?: string;
  llmProvider?: string;
  llmModel?: string;
  sttProvider?: string;
  ttsProvider?: string;
  voiceId?: string;
}

export interface UpdateAgentDTO {
  name?: string;
  instructions?: string;
  language?: string;
  greeting?: string;
  llmProvider?: string;
  llmModel?: string;
  sttProvider?: string;
  ttsProvider?: string;
  voiceId?: string;
  status?: 'active' | 'inactive';
}

export interface PhoneNumberDTO {
  id: string;
  organizationId: string;
  phoneNumber: string; // E.164 e.g. "+919876543210"
  provider: string; // "exotel"
  providerId?: string | null;
  agentId?: string | null;
  agent?: AgentDTO | null;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface CallTurnDTO {
  id: string;
  callId: string;
  sequence: number;
  speaker: 'user' | 'assistant';
  text: string;
  startedAt: string;
  endedAt?: string | null;
  latencyMs?: number | null;
}

export interface CallEventDTO {
  id: string;
  callId: string;
  eventName: string;
  payload?: Record<string, any> | null;
  createdAt: string;
}

export interface CallDTO {
  id: string;
  organizationId: string;
  agentId: string;
  agent?: AgentDTO | null;
  phoneNumberId?: string | null;
  phoneNumber?: PhoneNumberDTO | null;
  direction: CallDirection;
  fromNumber: string;
  toNumber: string;
  status: CallStatus;
  startedAt?: string | null;
  answeredAt?: string | null;
  endedAt?: string | null;
  durationSeconds?: number | null;
  turns?: CallTurnDTO[];
  events?: CallEventDTO[];
  createdAt: string;
}

export interface CreateCallRequest {
  agentId: string;
  to: string;
  from?: string;
}

export interface ListCallsQuery {
  agentId?: string;
  status?: CallStatus;
  direction?: CallDirection;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface OverviewMetricsDTO {
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
  totalMinutes: number;
  avgDurationSeconds: number;
  todayCalls: number;
  recentCalls: CallDTO[];
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: any;
  };
}

// Provider Contracts
export interface STTResult {
  text: string;
  confidence?: number;
  language?: string;
  latencyMs: number;
}

export interface STTProvider {
  name: string;
  transcribe(audio: Buffer, options?: { language?: string; sampleRate?: number }): Promise<STTResult>;
}

export interface LLMMessage {
  role: SpeakerRole;
  content: string;
}

export interface LLMResult {
  text: string;
  latencyMs: number;
}

export interface LLMProvider {
  name: string;
  generate(
    messages: LLMMessage[],
    systemPrompt: string,
    options?: { model?: string; temperature?: number }
  ): Promise<LLMResult>;
}

export interface TTSResult {
  audio: Buffer; // base64 or raw PCM/WAV
  format: string; // "wav" | "mp3" | "pcm"
  latencyMs: number;
}

export interface TTSProvider {
  name: string;
  synthesize(
    text: string,
    options?: { voice?: string; language?: string; sampleRate?: number }
  ): Promise<TTSResult>;
}

export interface TelephonyProvider {
  name: string;
  initiateCall(params: {
    to: string;
    from: string;
    callId: string;
    callbackUrl: string;
  }): Promise<{ providerCallId: string; status: string }>;
  terminateCall(providerCallId: string): Promise<boolean>;
}

// Realtime WebSocket & Audio Streaming Types
export interface ExotelMediaStreamMessage {
  event: 'connected' | 'start' | 'media' | 'stop';
  sequenceNumber?: string;
  streamSid?: string;
  media?: {
    payload: string; // base64 encoded audio
    chunk?: number;
    timestamp?: string;
  };
  call_sid?: string;
}

export interface SimulatorAudioMessage {
  type: 'audio_chunk' | 'text_message' | 'start_call' | 'end_call';
  payload?: string; // base64 audio or text
  agentId?: string;
}
