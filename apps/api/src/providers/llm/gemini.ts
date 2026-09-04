import { LLMProvider, LLMMessage, LLMResult } from './interface.js';

export class GeminiLLMProvider implements LLMProvider {
  name = 'gemini';
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel = 'gemini-2.5-flash') {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  async generate(
    messages: LLMMessage[],
    systemPrompt: string,
    options?: { model?: string; temperature?: number }
  ): Promise<LLMResult> {
    const startTime = Date.now();
    const model = options?.model || this.defaultModel;

    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    // Prepare contents formatted for Gemini
    // Map conversation turns: 'user' -> 'user', 'assistant' -> 'model'
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            temperature: options?.temperature ?? 0.7,
            maxOutputTokens: 250, // Keep voice responses concise
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Gemini API error: HTTP ${response.status} - ${errText}`);
      }

      const data = (await response.json()) as any;
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        'Mujhe samajh nahi aaya, kripya dobara boliye.';

      const latencyMs = Date.now() - startTime;
      return { text, latencyMs };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
