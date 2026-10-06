import type {
  GenerateRequest,
  GenerateResponse,
  ProviderHealth,
} from "../base/provider-types.js";
import type { ModelProvider } from "../base/provider.js";

export class OpenAIProvider implements ModelProvider {
  readonly name = "openai";

  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";

  async healthCheck(): Promise<ProviderHealth> {
    const startedAt = Date.now();

    if (!this.apiKey) {
      return {
        provider: this.name,
        healthy: false,
        latencyMs: Date.now() - startedAt,
        error: "OPENAI_API_KEY is not configured.",
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      const latencyMs = Date.now() - startedAt;

      if (!response.ok) {
        return {
          provider: this.name,
          healthy: false,
          latencyMs,
          error: `OpenAI health check failed with status ${response.status}.`,
        };
      }

      return {
        provider: this.name,
        healthy: true,
        latencyMs,
      };
    } catch (error) {
      return {
        provider: this.name,
        healthy: false,
        latencyMs: Date.now() - startedAt,
        error: error instanceof Error
          ? error.message
          : "OpenAI health check failed.",
      };
    }
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    const startedAt = Date.now();

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        stream: request.stream ?? false,
      }),
    });

    const latencyMs = Date.now() - startedAt;

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json() as {
      model?: string;
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

    const choice = data.choices?.[0];

    return {
      provider: this.name,
      model: data.model ?? request.model,
      content: choice?.message?.content ?? "",
      inputTokens: data.usage?.prompt_tokens ?? 0,
      outputTokens: data.usage?.completion_tokens ?? 0,
      totalTokens: data.usage?.total_tokens ?? 0,
      latencyMs,
      finishReason: choice?.finish_reason,
    };
  }
}
