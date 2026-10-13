import { DeploymentRepository } from "./deployment-repository.js";
import type { ModelDeployment, CreateDeploymentInput, UpdateDeploymentInput } from "./deployment-schema.js";

export class DeploymentService {
  constructor(private readonly repository: DeploymentRepository) {}

  async create(input: CreateDeploymentInput): Promise<ModelDeployment> {
    if (!input.modelId.trim() || !input.environment.trim() || !input.version.trim()) {
      throw new Error("modelId, environment, and version are required");
    }
    return this.repository.create(input);
  }

  async getById(id: string): Promise<ModelDeployment | null> {
    return this.repository.getById(id);
  }

  async list(): Promise<ModelDeployment[]> {
    return this.repository.list();
  }

  async update(id: string, input: UpdateDeploymentInput): Promise<ModelDeployment> {
    const result = await this.repository.update(id, input);
    if (!result) throw new Error("Deployment not found");
    return result;
  }

  async delete(id: string): Promise<void> {
    if (!(await this.repository.delete(id))) throw new Error("Deployment not found");
  }
}
