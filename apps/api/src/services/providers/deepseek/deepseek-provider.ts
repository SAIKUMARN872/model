import { ProviderError } from "../base/provider-error.js";
import type { ModelProvider } from "../base/provider.js";
import type {
  GenerateRequest,
  GenerateResponse,
  ProviderHealth,
} from "../base/provider-types.js";

type DeepSeekResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

export class DeepSeekProvider implements ModelProvider {
  readonly name = "deepseek";

  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY ?? "";
    this.baseUrl = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    if (!this.apiKey) {
      throw new ProviderError(
        "DEEPSEEK_API_KEY is not configured.",
        {
          provider: this.name,
          retryable: false,
        },
      );
    }

    const startedAt = Date.now();

    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.2,
          max_tokens: request.maxTokens,
          stream: request.stream ?? false,
        }),
      });
    } catch (error) {
      throw new ProviderError(
        error instanceof Error ? error.message : "DeepSeek request failed.",
        {
          provider: this.name,
          retryable: true,
        },
      );
    }

    if (!response.ok) {
      const errorText = await response.text();

      throw new ProviderError(
        `DeepSeek API returned ${response.status}: ${errorText}`,
        {
          provider: this.name,
          statusCode: response.status,
          retryable: response.status === 429 || response.status >= 500,
        },
      );
    }

    const data = (await response.json()) as DeepSeekResponse;
    const content = data.choices?.[0]?.message?.content ?? "";

    return {
      provider: this.name,
      model: request.model,
      content,
      inputTokens: data.usage?.prompt_tokens,
      outputTokens: data.usage?.completion_tokens,
      totalTokens: data.usage?.total_tokens,
      latencyMs: Date.now() - startedAt,
      finishReason: data.choices?.[0]?.finish_reason,
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startedAt = Date.now();

    if (!this.apiKey) {
      return {
        provider: this.name,
        healthy: false,
        error: "DEEPSEEK_API_KEY is not configured.",
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return {
        provider: this.name,
        healthy: response.ok,
        latencyMs: Date.now() - startedAt,
        ...(response.ok
          ? {}
          : { error: `DeepSeek returned HTTP ${response.status}.` }),
      };
    } catch (error) {
      return {
        provider: this.name,
        healthy: false,
        latencyMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : "Health check failed.",
      };
    }
  }
}
