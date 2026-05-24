import type { ChatRequest, ChatResponse, Provider } from './types.js';
import {
  AllProvidersFailedError,
  AuthError,
  ContentFilterError,
  LLMError,
  NetworkError,
  ProviderError,
  RateLimitError,
  ServerError,
} from './errors.js';
import { createLogger } from './logger.js';

const log = createLogger('LLMRouter');

const DEFAULT_RATE_LIMIT_COOLDOWN_MS = 60_000;

interface ProviderState {
  cooldownUntil: number;
  authKilled: boolean;
}

export interface RouterOptions {
  providers: Provider[];
  rateLimitCooldownMs?: number;
}

export class LLMRouter {
  private readonly providers: Provider[];
  private readonly state = new Map<string, ProviderState>();
  private readonly cooldownMs: number;

  constructor(options: RouterOptions) {
    if (options.providers.length === 0) {
      throw new Error('LLMRouter requires at least one provider');
    }
    this.providers = options.providers;
    this.cooldownMs = options.rateLimitCooldownMs ?? DEFAULT_RATE_LIMIT_COOLDOWN_MS;
    for (const p of this.providers) {
      this.state.set(p.name, { cooldownUntil: 0, authKilled: false });
    }
    log.info(`router initialized with ${this.providers.length} provider(s)`, {
      providers: this.providers.map((p) => `${p.name}${p.supportsVision ? '+vision' : ''}`),
    });
  }

  listProviders(): Array<{ name: string; supportsVision: boolean; available: boolean; cooldownMs: number }> {
    const now = Date.now();
    return this.providers.map((p) => {
      const s = this.state.get(p.name)!;
      return {
        name: p.name,
        supportsVision: p.supportsVision,
        available: !s.authKilled && s.cooldownUntil <= now,
        cooldownMs: Math.max(0, s.cooldownUntil - now),
      };
    });
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const now = Date.now();
    const eligible = this.providers.filter((p) => {
      if (request.needsVision && !p.supportsVision) return false;
      const s = this.state.get(p.name)!;
      if (s.authKilled) return false;
      if (s.cooldownUntil > now) return false;
      return true;
    });

    if (eligible.length === 0) {
      throw new AllProvidersFailedError(
        this.providers.map((p) => ({
          provider: p.name,
          error: new ProviderError(p.name, this.skipReason(p, request, now)),
        })),
      );
    }

    const attempts: Array<{ provider: string; error: Error }> = [];
    for (const provider of eligible) {
      try {
        const response = await provider.chat(request);
        log.debug(`${provider.name} ok`, {
          model: response.model,
          latencyMs: response.latencyMs,
        });
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        attempts.push({ provider: provider.name, error });

        if (err instanceof RateLimitError) {
          const cooldown = err.retryAfterMs ?? this.cooldownMs;
          this.state.get(provider.name)!.cooldownUntil = Date.now() + cooldown;
          log.warn(`${provider.name} rate-limited; cooling ${Math.round(cooldown / 1000)}s`);
          continue;
        }
        if (err instanceof AuthError) {
          this.state.get(provider.name)!.authKilled = true;
          log.warn(`${provider.name} auth failed; disabling for this process`, error.message);
          continue;
        }
        if (err instanceof ContentFilterError) {
          log.warn(`${provider.name} content-filter rejection; trying next`, error.message);
          continue;
        }
        if (err instanceof ServerError || err instanceof NetworkError) {
          log.warn(`${provider.name} ${err.constructor.name}; trying next`, error.message);
          continue;
        }
        if (err instanceof ProviderError) {
          log.error(`${provider.name} ProviderError (no fallback)`, error.message);
          throw err;
        }
        if (err instanceof LLMError) {
          log.warn(`${provider.name} unhandled LLMError`, error.message);
          continue;
        }
        log.warn(`${provider.name} unknown error`, error.message);
        continue;
      }
    }

    throw new AllProvidersFailedError(attempts);
  }

  private skipReason(p: Provider, request: ChatRequest, now: number): string {
    if (request.needsVision && !p.supportsVision) return 'does not support vision';
    const s = this.state.get(p.name)!;
    if (s.authKilled) return 'auth-killed';
    if (s.cooldownUntil > now) {
      return `cooling down for ${Math.round((s.cooldownUntil - now) / 1000)}s`;
    }
    return 'unknown';
  }
}
