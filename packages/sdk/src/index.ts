import type {
  AgentDTO,
  CreateAgentDTO,
  UpdateAgentDTO,
  CallDTO,
  CreateCallRequest,
  ListCallsQuery,
  PhoneNumberDTO,
  ApiKeyDTO,
  CreateApiKeyResponse,
  ApiErrorResponse,
} from '@waani/types';

export interface WaaniClientOptions {
  apiKey: string;
  baseUrl?: string;
}

export class WaaniError extends Error {
  code: string;
  requestId?: string;
  details?: any;

  constructor(code: string, message: string, requestId?: string, details?: any) {
    super(message);
    this.name = 'WaaniError';
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }
}

export class Waani {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: WaaniClientOptions) {
    if (!options.apiKey) {
      throw new Error('Waani API key is required');
    }
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl || 'http://localhost:8000').replace(/\/$/, '');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${this.apiKey}`);
    headers.set('Content-Type', 'application/json');
    headers.set('User-Agent', 'Waani-Node-SDK/0.1.0');

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const err = (data as ApiErrorResponse)?.error;
      throw new WaaniError(
        err?.code || 'API_ERROR',
        err?.message || `Request failed with status ${res.status}`,
        err?.requestId || res.headers.get('x-request-id') || undefined,
        err?.details
      );
    }

    return data as T;
  }

  readonly agents = {
    list: async (): Promise<{ data: AgentDTO[] }> => {
      return this.request<{ data: AgentDTO[] }>('/v1/agents');
    },

    get: async (agentId: string): Promise<AgentDTO> => {
      return this.request<AgentDTO>(`/v1/agents/${agentId}`);
    },

    create: async (params: CreateAgentDTO): Promise<AgentDTO> => {
      return this.request<AgentDTO>('/v1/agents', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },

    update: async (agentId: string, params: UpdateAgentDTO): Promise<AgentDTO> => {
      return this.request<AgentDTO>(`/v1/agents/${agentId}`, {
        method: 'PATCH',
        body: JSON.stringify(params),
      });
    },

    delete: async (agentId: string): Promise<{ success: boolean }> => {
      return this.request<{ success: boolean }>(`/v1/agents/${agentId}`, {
        method: 'DELETE',
      });
    },
  };

  readonly calls = {
    list: async (query?: ListCallsQuery): Promise<{ data: CallDTO[] }> => {
      const params = new URLSearchParams();
      if (query?.agentId) params.append('agentId', query.agentId);
      if (query?.status) params.append('status', query.status);
      if (query?.direction) params.append('direction', query.direction);
      if (query?.limit) params.append('limit', query.limit.toString());
      if (query?.offset) params.append('offset', query.offset.toString());
      const qs = params.toString() ? `?${params.toString()}` : '';
      return this.request<{ data: CallDTO[] }>(`/v1/calls${qs}`);
    },

    get: async (callId: string): Promise<CallDTO> => {
      return this.request<CallDTO>(`/v1/calls/${callId}`);
    },

    create: async (params: CreateCallRequest): Promise<CallDTO> => {
      return this.request<CallDTO>('/v1/calls', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },

    end: async (callId: string): Promise<{ success: boolean; status: string }> => {
      return this.request<{ success: boolean; status: string }>(`/v1/calls/${callId}/end`, {
        method: 'POST',
      });
    },
  };

  readonly phoneNumbers = {
    list: async (): Promise<{ data: PhoneNumberDTO[] }> => {
      return this.request<{ data: PhoneNumberDTO[] }>('/v1/phone-numbers');
    },

    get: async (id: string): Promise<PhoneNumberDTO> => {
      return this.request<PhoneNumberDTO>(`/v1/phone-numbers/${id}`);
    },

    update: async (id: string, params: { agentId?: string | null; status?: string }): Promise<PhoneNumberDTO> => {
      return this.request<PhoneNumberDTO>(`/v1/phone-numbers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(params),
      });
    },
  };

  readonly apiKeys = {
    list: async (): Promise<{ data: ApiKeyDTO[] }> => {
      return this.request<{ data: ApiKeyDTO[] }>('/v1/api-keys');
    },

    create: async (name: string): Promise<CreateApiKeyResponse> => {
      return this.request<CreateApiKeyResponse>('/v1/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
    },

    revoke: async (id: string): Promise<{ success: boolean }> => {
      return this.request<{ success: boolean }>(`/v1/api-keys/${id}`, {
        method: 'DELETE',
      });
    },
  };
}

export default Waani;
