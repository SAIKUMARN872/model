export type ProviderMessageRole = "system" | "user" | "assistant";

export type ProviderMessage = {
  role: ProviderMessageRole;
  content: string;
};

export type GenerateRequest = {
  model: string;
  messages: ProviderMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
};

export type GenerateResponse = {
  provider: string;
  model: string;
  content: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  latencyMs: number;
  finishReason?: string;
};

export type ProviderHealth = {
  provider: string;
  healthy: boolean;
  latencyMs?: number;
  error?: string;
};
