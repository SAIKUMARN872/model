import { AccessRepository } from "./access-repository.js";
import type { AccessRole, CreateAccessInput, ModelAccess, UpdateAccessInput } from "./access-schema.js";

export class AccessService {
  constructor(private readonly repository: AccessRepository) {}

  async grant(input: CreateAccessInput): Promise<ModelAccess> {
    if (!input.modelId.trim() || !input.userId.trim()) {
      throw new Error("modelId and userId are required");
    }

    const existing = await this.repository.listByModel(input.modelId);
    if (existing.some((item) => item.userId === input.userId)) {
      throw new Error("User already has access to this model");
    }

    return this.repository.create(input);
  }

  async getById(id: string): Promise<ModelAccess | null> {
    return this.repository.getById(id);
  }

  async list(): Promise<ModelAccess[]> {
    return this.repository.list();
  }

  async listByModel(modelId: string): Promise<ModelAccess[]> {
    return this.repository.listByModel(modelId);
  }

  async update(id: string, input: UpdateAccessInput): Promise<ModelAccess> {
    const result = await this.repository.update(id, input);
    if (!result) throw new Error("Access record not found");
    return result;
  }

  async revoke(id: string): Promise<void> {
    if (!(await this.repository.delete(id))) {
      throw new Error("Access record not found");
    }
  }

  async canAccess(
    modelId: string,
    userId: string,
    requiredRole: AccessRole = "viewer",
  ): Promise<boolean> {
    const records = await this.repository.listByModel(modelId);
    const access = records.find((item) => item.userId === userId);
    if (!access) return false;

    const rank: Record<AccessRole, number> = {
      viewer: 1,
      user: 2,
      admin: 3,
    };

    return rank[access.role] >= rank[requiredRole];
  }
}
