import type { ProviderMessage } from "../providers/base/provider-types.js";
import type { RegisteredModel } from "../model-registry/model-types.js";

export type ExecutionRequest = {
  model: RegisteredModel;
  messages: ProviderMessage[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
};

export type ExecutionResult = {
  provider: string;
  model: string;
  content: string;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  finishReason?: string;
};
