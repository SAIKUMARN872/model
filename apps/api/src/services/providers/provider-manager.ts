import type { ModelProvider } from "./base/provider.js";
import type { ProviderHealth } from "./base/provider-types.js";
import { DeepSeekProvider } from "./deepseek/deepseek-provider.js";
import { OllamaProvider } from "./ollama/ollama-provider.js";
import { QwenProvider } from "./qwen/qwen-provider.js";
import { OpenAIProvider } from "./openai/openai-provider.js";

export class ProviderManager {
  private readonly providers = new Map<string, ModelProvider>();

  constructor() {
    this.register(new DeepSeekProvider());
    this.register(new QwenProvider());
    this.register(new OllamaProvider());
    this.register(new OpenAIProvider());
  }

  register(provider: ModelProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(providerName: string): ModelProvider | undefined {
    return this.providers.get(providerName);
  }

  list(): string[] {
    return [...this.providers.keys()];
  }

  async healthCheckAll(): Promise<Map<string, ProviderHealth>> {
    const results = new Map<string, ProviderHealth>();

    await Promise.all(
      [...this.providers.values()].map(async (provider) => {
        try {
          const health = await provider.healthCheck();
          results.set(provider.name, health);
        } catch (error) {
          results.set(provider.name, {
            provider: provider.name,
            healthy: false,
            error: error instanceof Error
              ? error.message
              : "Provider health check failed.",
          });
        }
      }),
    );

    return results;
  }
}

export const providerManager = new ProviderManager();
