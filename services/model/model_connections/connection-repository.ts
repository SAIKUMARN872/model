import type { ModelConnection, CreateConnectionInput, UpdateConnectionInput } from "./connection-schema.js";

export class ConnectionRepository {
  private records = new Map<string, ModelConnection>();
  private nextId = 1;

  async create(input: CreateConnectionInput): Promise<ModelConnection> {
    const now = new Date();
    const record: ModelConnection = {
      id: `connection-${this.nextId++}`,
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    this.records.set(record.id, record);
    return { ...record };
  }

  async getById(id: string): Promise<ModelConnection | null> {
    const record = this.records.get(id);
    return record ? { ...record } : null;
  }

  async list(): Promise<ModelConnection[]> {
    return [...this.records.values()].map((record) => ({ ...record }));
  }

  async update(id: string, input: UpdateConnectionInput): Promise<ModelConnection | null> {
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
