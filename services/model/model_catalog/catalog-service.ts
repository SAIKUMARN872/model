import { CatalogRepository } from "./catalog-repository.js";
import type { CatalogModel, CreateCatalogInput, UpdateCatalogInput } from "./catalog-schema.js";

export class CatalogService {
  constructor(private readonly repository: CatalogRepository) {}

  async create(input: CreateCatalogInput): Promise<CatalogModel> {
    if (!input.name.trim()) throw new Error("Model name is required");
    return this.repository.create(input);
  }

  async getById(id: string): Promise<CatalogModel | null> {
    return this.repository.getById(id);
  }

  async list(): Promise<CatalogModel[]> {
    return this.repository.list();
  }

  async update(id: string, input: UpdateCatalogInput): Promise<CatalogModel> {
    const result = await this.repository.update(id, input);
    if (!result) throw new Error("Catalog model not found");
    return result;
  }

  async delete(id: string): Promise<void> {
    if (!(await this.repository.delete(id))) throw new Error("Catalog model not found");
  }
}
