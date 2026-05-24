import type { ChatMessage, ChatRequest, ChatResponse, Provider } from '../types.js';
import {
  AuthError,
  ContentFilterError,
  NetworkError,
  ProviderError,
  RateLimitError,
  ServerError,
} from '../errors.js';

function looksLikeContentFilter(body: string): boolean {
  const lower = body.toLowerCase();
  return (
    lower.includes('content_filter') ||
    lower.includes('responsibleaipolicy') ||
    lower.includes('responsible ai') ||
    lower.includes('content management policy') ||
    lower.includes('moderation') ||
    lower.includes('jailbreak')
  );
}

export interface OpenAICompatibleConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  defaultModel: string;
  visionModel?: string;
  supportsVision: boolean;
  extraHeaders?: Record<string, string>;
  endpoint?: string;
  defaultMaxTokens?: number;
  defaultTemperature?: number | null;
  timeoutMs?: number;
}

interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  error?: { message?: string; type?: string; code?: string };
}

function buildPayload(req: ChatRequest, model: string, defaultMaxTokens: number, defaultTemperature: number | null): unknown {
  const messages: ChatMessage[] = [];
  if (req.systemPrompt) messages.push({ role: 'system', content: req.systemPrompt });
  for (const m of req.messages) messages.push(m);

  const body: Record<string, unknown> = {
    model,
    messages,
    max_tokens: req.maxTokens ?? defaultMaxTokens,
  };
  const temp = req.temperature ?? defaultTemperature;
  if (temp !== null) body.temperature = temp;
  return body;
}

function parseRetryAfterMs(headers: Headers): number | undefined {
  const raw = headers.get('retry-after');
  if (!raw) return undefined;
  const seconds = Number(raw);
  if (Number.isFinite(seconds)) return seconds * 1000;
  return undefined;
}

export class OpenAICompatibleProvider implements Provider {
  readonly name: string;
  readonly supportsVision: boolean;
  private readonly config: Required<OpenAICompatibleConfig>;

  constructor(config: OpenAICompatibleConfig) {
    this.name = config.name;
    this.supportsVision = config.supportsVision;
    this.config = {
      endpoint: '/chat/completions',
      defaultMaxTokens: 1024,
      defaultTemperature: 0.7,
      timeoutMs: 60_000,
      visionModel: config.defaultModel,
      extraHeaders: {},
      ...config,
    };
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const start = Date.now();
    const model = req.model ?? (req.needsVision ? this.config.visionModel : this.config.defaultModel);
    const payload = buildPayload(req, model, this.config.defaultMaxTokens, this.config.defaultTemperature);
    const url = this.config.baseUrl.replace(/\/$/, '') + this.config.endpoint;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.config.timeoutMs);

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
          ...this.config.extraHeaders,
        },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
    } catch (err) {
      throw new NetworkError(this.name, `network failure: ${err instanceof Error ? err.message : String(err)}`, err);
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const detail = text || res.statusText;
      switch (res.status) {
        case 401:
        case 403:
          throw new AuthError(this.name, `auth failed (${res.status}): ${detail}`);
        case 429:
          throw new RateLimitError(this.name, `rate limited: ${detail}`, parseRetryAfterMs(res.headers));
        case 400:
        case 404:
        case 422:
          if (looksLikeContentFilter(detail)) {
            throw new ContentFilterError(this.name, `content filter (${res.status}): ${detail.slice(0, 300)}`);
          }
          throw new ProviderError(this.name, `bad request (${res.status}): ${detail}`);
        default:
          if (res.status >= 500) throw new ServerError(this.name, `server error (${res.status}): ${detail}`);
          throw new ProviderError(this.name, `unexpected status (${res.status}): ${detail}`);
      }
    }

    let data: OpenAIResponse;
    try {
      data = (await res.json()) as OpenAIResponse;
    } catch (err) {
      throw new ProviderError(this.name, 'malformed JSON response', err);
    }
    if (data.error) throw new ProviderError(this.name, data.error.message ?? 'unknown error');

    const text = data.choices?.[0]?.message?.content ?? '';
    if (!text) throw new ProviderError(this.name, 'empty response from upstream');

    return {
      text,
      provider: this.name,
      model,
      latencyMs: Date.now() - start,
      promptTokens: data.usage?.prompt_tokens ?? null,
      completionTokens: data.usage?.completion_tokens ?? null,
    };
  }
}
