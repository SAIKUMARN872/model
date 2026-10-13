import type { ModelVersion, CreateVersionInput, UpdateVersionInput } from "./version-schema.js";

export class VersionRepository {
  private records = new Map<string, ModelVersion>();
  private nextId = 1;

  async create(input: CreateVersionInput): Promise<ModelVersion> {
    const now = new Date();
    const record: ModelVersion = {
      id: `version-${this.nextId++}`,
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    this.records.set(record.id, record);
    return { ...record };
  }

  async getById(id: string): Promise<ModelVersion | null> {
    const record = this.records.get(id);
    return record ? { ...record } : null;
  }

  async list(): Promise<ModelVersion[]> {
    return [...this.records.values()].map((record) => ({ ...record }));
  }

  async update(id: string, input: UpdateVersionInput): Promise<ModelVersion | null> {
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
