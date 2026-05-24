export type ChatRole = 'user' | 'assistant' | 'system';

export type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export interface ChatMessage {
  role: ChatRole;
  content: string | ContentPart[];
}

export interface ChatRequest {
  systemPrompt?: string;
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  needsVision?: boolean;
}

export interface ChatResponse {
  text: string;
  provider: string;
  model: string;
  latencyMs: number;
  promptTokens: number | null;
  completionTokens: number | null;
}

export interface Provider {
  readonly name: string;
  readonly supportsVision: boolean;
  chat(request: ChatRequest): Promise<ChatResponse>;
}
