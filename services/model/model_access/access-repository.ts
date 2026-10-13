import type { ModelAccess, CreateAccessInput, UpdateAccessInput } from "./access-schema.js";

export class AccessRepository {
  private records = new Map<string, ModelAccess>();
  private nextId = 1;

  async create(input: CreateAccessInput): Promise<ModelAccess> {
    const now = new Date();
    const record: ModelAccess = {
      id: `access-${this.nextId++}`,
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    this.records.set(record.id, record);
    return { ...record };
  }

  async getById(id: string): Promise<ModelAccess | null> {
    const record = this.records.get(id);
    return record ? { ...record } : null;
  }

  async list(): Promise<ModelAccess[]> {
    return [...this.records.values()].map((record) => ({ ...record }));
  }

  async listByModel(modelId: string): Promise<ModelAccess[]> {
    return (await this.list()).filter((record) => record.modelId === modelId);
  }

  async update(id: string, input: UpdateAccessInput): Promise<ModelAccess | null> {
    const record = this.records.get(id);
    if (!record) return null;

    const updated = { ...record, ...input, updatedAt: new Date() };
    this.records.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.records.delete(id);
  }
}
