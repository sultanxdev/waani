import { LLMProvider, LLMMessage, LLMResult } from './interface.js';

export class OpenAILLMProvider implements LLMProvider {
  name = 'openai';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(
    messages: LLMMessage[],
    systemPrompt: string,
    options?: { model?: string; temperature?: number }
  ): Promise<LLMResult> {
    const startTime = Date.now();
    const model = options?.model || 'gpt-4o-mini';

    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: 250,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`OpenAI API error: HTTP ${response.status} - ${errText}`);
      }

      const data = (await response.json()) as any;
      const text =
        data.choices?.[0]?.message?.content?.trim() ||
        'Mujhe samajh nahi aaya, kripya dobara boliye.';

      const latencyMs = Date.now() - startTime;
      return { text, latencyMs };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
