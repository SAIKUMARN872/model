import type { ModelProvider } from "../providers/base/provider.js";
import { ProviderError } from "../providers/base/provider-error.js";
import type { ExecutionRequest, ExecutionResult } from "./execution-types.js";

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Model execution timed out after ${timeoutMs}ms.`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export class ExecutionService {
  async execute(
    provider: ModelProvider,
    request: ExecutionRequest,
  ): Promise<ExecutionResult> {
    const timeoutMs = request.timeoutMs ?? 30000;

    try {
      const response = await withTimeout(
        provider.generate({
          model: request.model.providerModel,
          messages: request.messages,
          temperature: request.temperature,
          maxTokens: request.maxTokens,
          stream: false,
        }),
        timeoutMs,
      );

      return {
        provider: response.provider,
        model: response.model,
        content: response.content,
        latencyMs: response.latencyMs,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        totalTokens: response.totalTokens,
        finishReason: response.finishReason,
      };
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }

      throw new ProviderError(
        error instanceof Error ? error.message : "Model execution failed.",
        {
          provider: provider.name,
          retryable: true,
        },
      );
    }
  }
}

export const executionService = new ExecutionService();
