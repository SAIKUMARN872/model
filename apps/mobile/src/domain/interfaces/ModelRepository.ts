export interface ModelRecord {
  id: string;
  name: string;
  provider: string;
  description?: string;
  version?: string;
  enabled: boolean;
  contextWindow?: number;
  maxOutputTokens?: number;
  createdAt: string;
  updatedAt: string;
}

export class ModelRepository {
  private models: Map<string, ModelRecord> = new Map();

  public create(
    model: ModelRecord
  ): ModelRecord {
    if (!model.id) {
      throw new Error("Model ID is required.");
    }

    this.models.set(
      model.id,
      model
    );

    return model;
  }

  public findById(
    id: string
  ): ModelRecord | undefined {
    return this.models.get(id);
  }

  public findAll(): ModelRecord[] {
    return Array.from(
      this.models.values()
    );
  }

  public findEnabled(): ModelRecord[] {
    return this.findAll().filter(
      (model) => model.enabled
    );
  }

  public update(
    id: string,
    updates: Partial<ModelRecord>
  ): ModelRecord | undefined {
    const existing =
      this.models.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: ModelRecord = {
      ...existing,
      ...updates,
      id,
      updatedAt:
        new Date().toISOString(),
    };

    this.models.set(
      id,
      updated
    );

    return updated;
  }

  public delete(
    id: string
  ): boolean {
    return this.models.delete(id);
  }

  public enable(
    id: string
  ): ModelRecord | undefined {
    return this.update(id, {
      enabled: true,
    });
  }

  public disable(
    id: string
  ): ModelRecord | undefined {
    return this.update(id, {
      enabled: false,
    });
  }

  public exists(
    id: string
  ): boolean {
    return this.models.has(id);
  }

  public count(): number {
    return this.models.size;
  }

  public clear(): void {
    this.models.clear();
  }
}

const modelRepository =
  new ModelRepository();

export default modelRepository;