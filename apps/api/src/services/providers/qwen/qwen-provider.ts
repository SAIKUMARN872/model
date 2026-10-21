import { ProviderError } from "../base/provider-error.js";
import type { ModelProvider } from "../base/provider.js";
import type {
  GenerateRequest,
  GenerateResponse,
  ProviderHealth,
} from "../base/provider-types.js";

type QwenResponse = {
  choices?: Array<{
    message?: { content?: string };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

export class QwenProvider implements ModelProvider {
  readonly name = "qwen";

  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.QWEN_API_KEY ?? "";
    this.baseUrl = process.env.QWEN_BASE_URL ?? "";
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    if (!this.apiKey) {
      throw new ProviderError("QWEN_API_KEY is not configured.", {
        provider: this.name,
        retryable: false,
      });
    }

    if (!this.baseUrl) {
      throw new ProviderError("QWEN_BASE_URL is not configured.", {
        provider: this.name,
        retryable: false,
      });
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
          stream: false,
        }),
      });
    } catch (error) {
      throw new ProviderError(
        error instanceof Error ? error.message : "Qwen request failed.",
        { provider: this.name, retryable: true }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new ProviderError(
        `Qwen API returned ${response.status}: ${errorText}`,
        {
          provider: this.name,
          statusCode: response.status,
          retryable: response.status === 429 || response.status >= 500,
        }
      );
    }

    const data = (await response.json()) as QwenResponse;
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
    return {
      provider: this.name,
      healthy: Boolean(this.apiKey && this.baseUrl),
      ...(this.apiKey ? {} : { error: "QWEN_API_KEY is not configured." }),
    };
  }
}
