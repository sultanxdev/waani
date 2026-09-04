import { STTProvider, STTResult } from './interface.js';

export class SarvamSTTProvider implements STTProvider {
  name = 'sarvam';
  private apiKey: string;
  private endpoint = 'https://api.sarvam.ai/speech-to-text';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribe(
    audio: Buffer,
    options?: { language?: string; sampleRate?: number }
  ): Promise<STTResult> {
    const startTime = Date.now();

    if (!this.apiKey) {
      throw new Error('Sarvam API key is not configured');
    }

    const formData = new FormData();
    const blob = new Blob([audio], { type: 'audio/wav' });
    formData.append('file', blob, 'audio.wav');
    formData.append('model', 'saaras:v2');
    formData.append('language_code', options?.language || 'hi-IN');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'api-subscription-key': this.apiKey,
        },
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Sarvam STT failed: HTTP ${response.status} - ${errorText}`);
      }

      const data = (await response.json()) as { transcript?: string; confidence?: number; language_code?: string };
      const latencyMs = Date.now() - startTime;

      return {
        text: data.transcript || '',
        confidence: data.confidence ?? 0.95,
        language: data.language_code || options?.language || 'hi-IN',
        latencyMs,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
