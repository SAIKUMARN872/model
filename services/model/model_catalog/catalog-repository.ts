import type { CatalogModel, CreateCatalogInput, UpdateCatalogInput } from "./catalog-schema.js";

export class CatalogRepository {
  private records = new Map<string, CatalogModel>();
  private nextId = 1;

  async create(input: CreateCatalogInput): Promise<CatalogModel> {
    const now = new Date();
    const record: CatalogModel = {
      id: `catalog-${this.nextId++}`,
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    this.records.set(record.id, record);
    return { ...record };
  }

  async getById(id: string): Promise<CatalogModel | null> {
    const record = this.records.get(id);
    return record ? { ...record } : null;
  }

  async list(): Promise<CatalogModel[]> {
    return [...this.records.values()].map((record) => ({ ...record }));
  }

  async update(id: string, input: UpdateCatalogInput): Promise<CatalogModel | null> {
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
