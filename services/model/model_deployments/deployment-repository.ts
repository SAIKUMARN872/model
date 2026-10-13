import type { ModelDeployment, CreateDeploymentInput, UpdateDeploymentInput } from "./deployment-schema.js";

export class DeploymentRepository {
  private records = new Map<string, ModelDeployment>();
  private nextId = 1;

  async create(input: CreateDeploymentInput): Promise<ModelDeployment> {
    const now = new Date();
    const record: ModelDeployment = {
      id: `deployment-${this.nextId++}`,
      ...input,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    this.records.set(record.id, record);
    return { ...record };
  }

  async getById(id: string): Promise<ModelDeployment | null> {
    const record = this.records.get(id);
    return record ? { ...record } : null;
  }

  async list(): Promise<ModelDeployment[]> {
    return [...this.records.values()].map((record) => ({ ...record }));
  }

  async update(id: string, input: UpdateDeploymentInput): Promise<ModelDeployment | null> {
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
