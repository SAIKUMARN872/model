import type {
  GenerateRequest,
  GenerateResponse,
  ProviderHealth,
} from "./provider-types.js";

export interface ModelProvider {
  readonly name: string;

  generate(request: GenerateRequest): Promise<GenerateResponse>;

  healthCheck(): Promise<ProviderHealth>;
}
