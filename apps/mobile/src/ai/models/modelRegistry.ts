export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  description?: string;
  contextWindow?: number;
  maxOutputTokens?: number;
  enabled?: boolean;
}

export class ModelRegistry {
  private models: Map<string, ModelConfig> = new Map();

  constructor() {
    this.registerDefaultModels();
  }

  private registerDefaultModels(): void {
    this.register({
      id: "default",
      name: "Default Model",
      provider: "local",
      description: "Default AI model configuration",
      contextWindow: 8192,
      maxOutputTokens: 2048,
      enabled: true,
    });
  }

  public register(model: ModelConfig): void {
    if (!model.id) {
      throw new Error("Model ID is required.");
    }

    this.models.set(model.id, {
      ...model,
      enabled: model.enabled ?? true,
    });
  }

  public get(modelId: string): ModelConfig | undefined {
    return this.models.get(modelId);
  }

  public getModel(modelId: string): ModelConfig {
    const model = this.models.get(modelId);

    if (!model) {
      throw new Error(`Model "${modelId}" not found.`);
    }

    return model;
  }

  public has(modelId: string): boolean {
    return this.models.has(modelId);
  }

  public remove(modelId: string): boolean {
    return this.models.delete(modelId);
  }

  public list(): ModelConfig[] {
    return Array.from(this.models.values());
  }

  public listEnabled(): ModelConfig[] {
    return this.list().filter(
      (model) => model.enabled === true
    );
  }

  public enable(modelId: string): void {
    const model = this.getModel(modelId);

    model.enabled = true;

    this.models.set(modelId, model);
  }

  public disable(modelId: string): void {
    const model = this.getModel(modelId);

    model.enabled = false;

    this.models.set(modelId, model);
  }

  public clear(): void {
    this.models.clear();
  }

  public count(): number {
    return this.models.size;
  }
}

const modelRegistry = new ModelRegistry();

export default modelRegistry;