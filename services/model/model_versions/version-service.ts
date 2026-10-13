import { VersionRepository } from "./version-repository.js";
import type { ModelVersion, CreateVersionInput, UpdateVersionInput } from "./version-schema.js";

export class VersionService {
  constructor(private readonly repository: VersionRepository) {}

  async create(input: CreateVersionInput): Promise<ModelVersion> {
    if (!input.modelId.trim() || !input.version.trim()) {
      throw new Error("modelId and version are required");
    }
    return this.repository.create(input);
  }

  async getById(id: string): Promise<ModelVersion | null> {
    return this.repository.getById(id);
  }

  async list(): Promise<ModelVersion[]> {
    return this.repository.list();
  }

  async update(id: string, input: UpdateVersionInput): Promise<ModelVersion> {
    const result = await this.repository.update(id, input);
    if (!result) throw new Error("Version not found");
    return result;
  }

  async delete(id: string): Promise<void> {
    if (!(await this.repository.delete(id))) throw new Error("Version not found");
  }
}
