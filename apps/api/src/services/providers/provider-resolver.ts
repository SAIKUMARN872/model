import type { ModelProvider } from "./base/provider.js";
import { ProviderError } from "./base/provider-error.js";

export function resolveProvider(
  providerName: string,
  providers: Map<string, ModelProvider>,
): ModelProvider {
  const provider = providers.get(providerName);

  if (!provider) {
    throw new ProviderError(
      `Provider is not registered: ${providerName}`,
      {
        provider: providerName,
        retryable: false,
      },
    );
  }

  return provider;
}
