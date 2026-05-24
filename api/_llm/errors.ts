export class LLMError extends Error {
  constructor(public readonly provider: string, message: string, public readonly cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class RateLimitError extends LLMError {
  constructor(provider: string, message: string, public readonly retryAfterMs?: number, cause?: unknown) {
    super(provider, message, cause);
  }
}

export class AuthError extends LLMError {}
export class ServerError extends LLMError {}
export class NetworkError extends LLMError {}
export class ProviderError extends LLMError {}
export class ContentFilterError extends LLMError {}

export class AllProvidersFailedError extends Error {
  constructor(public readonly attempts: Array<{ provider: string; error: Error }>) {
    super(
      `All ${attempts.length} provider(s) failed:\n` +
        attempts.map((a) => `  - ${a.provider}: ${a.error.message}`).join('\n'),
    );
    this.name = 'AllProvidersFailedError';
  }
}
