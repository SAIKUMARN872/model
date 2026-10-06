import { ProviderError } from "../base/provider-error.js";
import type { ModelProvider } from "../base/provider.js";
import type {
  GenerateRequest,
  GenerateResponse,
  ProviderHealth,
} from "../base/provider-types.js";

type OllamaResponse = {
  message?: {
    role?: string;
    content?: string;
  };
  done?: boolean;
  done_reason?: string;
  total_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
};

export class OllamaProvider implements ModelProvider {
  readonly name = "ollama";

  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = (
      process.env.OLLAMA_BASE_URL ?? "http://localhost:11434"
    ).replace(/\/+$/, "");
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const startedAt = Date.now();

    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          stream: false,
          options: {
            temperature: request.temperature ?? 0.2,
            ...(request.maxTokens
              ? { num_predict: request.maxTokens }
              : {}),
          },
        }),
      });
    } catch (error) {
      throw new ProviderError(
        error instanceof Error
          ? error.message
          : "Ollama request failed.",
        {
          provider: this.name,
          retryable: true,
        },
      );
    }

    if (!response.ok) {
      const errorText = await response.text();

      throw new ProviderError(
        `Ollama API returned ${response.status}: ${errorText}`,
        {
          provider: this.name,
          statusCode: response.status,
          retryable: response.status === 429 || response.status >= 500,
        },
      );
    }

    const data = (await response.json()) as OllamaResponse;
    const content = data.message?.content ?? "";

    const latencyMs = data.total_duration
      ? data.total_duration / 1_000_000
      : Date.now() - startedAt;

    return {
      provider: this.name,
      model: request.model,
      content,
      inputTokens: data.prompt_eval_count,
      outputTokens: data.eval_count,
      totalTokens:
        data.prompt_eval_count !== undefined && data.eval_count !== undefined
          ? data.prompt_eval_count + data.eval_count
          : undefined,
      latencyMs,
      finishReason: data.done_reason,
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startedAt = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);

      return {
        provider: this.name,
        healthy: response.ok,
        latencyMs: Date.now() - startedAt,
        ...(response.ok
          ? {}
          : { error: `Ollama returned HTTP ${response.status}.` }),
      };
    } catch (error) {
      return {
        provider: this.name,
        healthy: false,
        latencyMs: Date.now() - startedAt,
        error:
          error instanceof Error
            ? error.message
            : "Ollama health check failed.",
      };
    }
  }
}
