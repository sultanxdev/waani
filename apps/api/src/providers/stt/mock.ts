import { STTProvider, STTResult } from './interface.js';

export class MockSTTProvider implements STTProvider {
  name = 'mock-stt';

  async transcribe(
    _audio: Buffer,
    options?: { language?: string; sampleRate?: number }
  ): Promise<STTResult> {
    const startTime = Date.now();
    // Simulate brief network delay
    await new Promise((resolve) => setTimeout(resolve, 150));

    return {
      text: 'Mujhe appointment chahiye',
      confidence: 0.98,
      language: options?.language || 'hi-IN',
      latencyMs: Date.now() - startTime,
    };
  }
}
