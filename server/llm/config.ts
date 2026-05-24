import type { Provider } from './types.js';
import { OpenAICompatibleProvider } from './providers/openaiCompatible.js';
import { GoogleAIProvider } from './providers/googleAi.js';
import { createLogger } from './logger.js';

const log = createLogger('LLMConfig');

/**
 * Build a provider chain from env vars. Each provider with a configured key
 * is included; the rest are silently skipped. Order encodes preference.
 * Override with LLM_PROVIDER_ORDER=groq,googleAi,...
 */
export function providersFromEnv(): Provider[] {
  const providers: Provider[] = [];
  const env = process.env;

  if (env.CEREBRAS_API_KEY) {
    providers.push(new OpenAICompatibleProvider({
      name: 'cerebras',
      baseUrl: 'https://api.cerebras.ai/v1',
      apiKey: env.CEREBRAS_API_KEY,
      defaultModel: env.CEREBRAS_MODEL ?? 'llama-3.3-70b',
      supportsVision: false,
    }));
  }

  if (env.GROQ_API_KEY) {
    providers.push(new OpenAICompatibleProvider({
      name: 'groq',
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey: env.GROQ_API_KEY,
      defaultModel: env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
      visionModel: env.GROQ_VISION_MODEL ?? 'meta-llama/llama-4-scout-17b-16e-instruct',
      supportsVision: true,
    }));
  }

  if (env.NVIDIA_API_KEY) {
    providers.push(new OpenAICompatibleProvider({
      name: 'nvidia',
      baseUrl: 'https://integrate.api.nvidia.com/v1',
      apiKey: env.NVIDIA_API_KEY,
      defaultModel: env.NVIDIA_MODEL ?? 'meta/llama-3.3-70b-instruct',
      visionModel: env.NVIDIA_VISION_MODEL ?? 'meta/llama-3.2-90b-vision-instruct',
      supportsVision: true,
    }));
  }

  if (env.OPENROUTER_API_KEY) {
    providers.push(new OpenAICompatibleProvider({
      name: 'openrouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: env.OPENROUTER_API_KEY,
      defaultModel: env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.3-70b-instruct:free',
      visionModel: env.OPENROUTER_VISION_MODEL ?? 'meta-llama/llama-3.2-90b-vision-instruct:free',
      supportsVision: true,
      extraHeaders: {
        'HTTP-Referer': env.OPENROUTER_REFERER ?? 'https://fourlinq.ph',
        'X-Title': env.OPENROUTER_TITLE ?? 'FourlinQ LinQ Assistant',
      },
    }));
  }

  const geminiKey = env.GOOGLE_AI_STUDIO_API_KEY ?? env.GEMINI_API_KEY;
  if (geminiKey) {
    providers.push(new GoogleAIProvider({
      apiKey: geminiKey,
      defaultModel: env.GOOGLE_AI_STUDIO_MODEL ?? 'gemini-2.5-flash',
    }));
  }

  if (env.GITHUB_MODELS_TOKEN) {
    providers.push(new OpenAICompatibleProvider({
      name: 'github',
      baseUrl: 'https://models.inference.ai.azure.com',
      apiKey: env.GITHUB_MODELS_TOKEN,
      defaultModel: env.GITHUB_MODELS_MODEL ?? 'gpt-4o',
      visionModel: env.GITHUB_MODELS_VISION_MODEL ?? 'gpt-4o',
      supportsVision: true,
    }));
  }

  if (env.MISTRAL_API_KEY) {
    providers.push(new OpenAICompatibleProvider({
      name: 'mistral',
      baseUrl: 'https://api.mistral.ai/v1',
      apiKey: env.MISTRAL_API_KEY,
      defaultModel: env.MISTRAL_MODEL ?? 'mistral-small-latest',
      supportsVision: false,
    }));
  }

  if (env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ACCOUNT_ID) {
    providers.push(new OpenAICompatibleProvider({
      name: 'cloudflare',
      baseUrl: `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
      apiKey: env.CLOUDFLARE_API_TOKEN,
      defaultModel: env.CLOUDFLARE_MODEL ?? '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      supportsVision: false,
    }));
  }

  if (env.LLM_PROVIDER_ORDER) {
    const order = env.LLM_PROVIDER_ORDER.split(',').map((s) => s.trim()).filter(Boolean);
    const byName = new Map(providers.map((p) => [p.name, p]));
    const reordered: Provider[] = [];
    for (const name of order) {
      const p = byName.get(name);
      if (p) { reordered.push(p); byName.delete(name); }
    }
    for (const p of byName.values()) reordered.push(p);
    if (reordered.length > 0) {
      log.info('provider order overridden by LLM_PROVIDER_ORDER', { order: reordered.map((p) => p.name) });
      return reordered;
    }
  }

  if (providers.length === 0) {
    log.warn('no LLM provider keys configured — chat will fail');
  } else {
    log.info(`configured ${providers.length} provider(s)`, { providers: providers.map((p) => p.name) });
  }
  return providers;
}
