import type { ChatMessage, ChatRequest, ChatResponse, ContentPart, Provider } from '../types.js';
import { AuthError, NetworkError, ProviderError, RateLimitError, ServerError } from '../errors.js';

export interface GoogleAIConfig {
  name?: string;
  apiKey: string;
  defaultModel?: string;
  visionModel?: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export class GoogleAIProvider implements Provider {
  readonly name: string;
  readonly supportsVision = true;
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly visionModel: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(config: GoogleAIConfig) {
    this.name = config.name ?? 'googleAi';
    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel ?? 'gemini-2.5-flash';
    this.visionModel = config.visionModel ?? this.defaultModel;
    this.baseUrl = (config.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');
    this.timeoutMs = config.timeoutMs ?? 60_000;
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const start = Date.now();
    const model = req.model ?? (req.needsVision ? this.visionModel : this.defaultModel);

    const contents = await Promise.all(req.messages.map((m) => this.toGeminiContent(m)));
    const body: Record<string, unknown> = { contents };
    if (req.systemPrompt) body.system_instruction = { parts: [{ text: req.systemPrompt }] };

    const generationConfig: Record<string, unknown> = {};
    if (req.maxTokens !== undefined) generationConfig.max_output_tokens = req.maxTokens;
    if (req.temperature !== undefined) generationConfig.temperature = req.temperature;
    if (Object.keys(generationConfig).length > 0) body.generation_config = generationConfig;

    const url = `${this.baseUrl}/models/${model}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
    } catch (err) {
      throw new NetworkError(this.name, `network failure: ${err instanceof Error ? err.message : String(err)}`, err);
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      switch (res.status) {
        case 401:
        case 403:
          throw new AuthError(this.name, `auth failed (${res.status}): ${text}`);
        case 429:
          throw new RateLimitError(this.name, `rate limited: ${text}`);
        case 400:
        case 404:
          throw new ProviderError(this.name, `bad request (${res.status}): ${text}`);
        default:
          if (res.status >= 500) throw new ServerError(this.name, `server error (${res.status}): ${text}`);
          throw new ProviderError(this.name, `unexpected status (${res.status}): ${text}`);
      }
    }

    interface GeminiResponse {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
      error?: { message?: string };
    }

    let data: GeminiResponse;
    try {
      data = (await res.json()) as GeminiResponse;
    } catch (err) {
      throw new ProviderError(this.name, 'malformed JSON response', err);
    }
    if (data.error) throw new ProviderError(this.name, data.error.message ?? 'unknown error');

    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    if (!text) throw new ProviderError(this.name, 'empty response from upstream');

    return {
      text,
      provider: this.name,
      model,
      latencyMs: Date.now() - start,
      promptTokens: data.usageMetadata?.promptTokenCount ?? null,
      completionTokens: data.usageMetadata?.candidatesTokenCount ?? null,
    };
  }

  private async toGeminiContent(message: ChatMessage): Promise<{
    role: 'user' | 'model';
    parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }>;
  }> {
    const role = message.role === 'assistant' ? 'model' : 'user';
    const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [];
    if (typeof message.content === 'string') {
      parts.push({ text: message.content });
    } else {
      for (const part of message.content) {
        if (part.type === 'text') parts.push({ text: part.text });
        else if (part.type === 'image_url') parts.push({ inline_data: await this.toInlineImage(part) });
      }
    }
    return { role, parts };
  }

  private async toInlineImage(part: Extract<ContentPart, { type: 'image_url' }>): Promise<{ mime_type: string; data: string }> {
    const url = part.image_url.url;
    if (url.startsWith('data:')) {
      const match = url.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) throw new ProviderError(this.name, 'malformed data URL');
      return { mime_type: match[1], data: match[2] };
    }
    const r = await fetch(url);
    if (!r.ok) throw new ProviderError(this.name, `image fetch failed (${r.status})`);
    const buf = Buffer.from(await r.arrayBuffer());
    const mime = r.headers.get('content-type') ?? 'image/png';
    return { mime_type: mime, data: buf.toString('base64') };
  }
}
