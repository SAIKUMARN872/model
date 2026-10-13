import type { FineTuningDeployment } from "../fine-tuning.types.js";

function cloneDeployment(
  deployment: FineTuningDeployment
): FineTuningDeployment {
  return structuredClone(deployment);
}

export class DeploymentManager {
  private readonly deployments = new Map<string, FineTuningDeployment>();

  async create(
    deployment: FineTuningDeployment
  ): Promise<FineTuningDeployment> {
    if (this.deployments.has(deployment.id)) {
      throw new Error(`Deployment '${deployment.id}' already exists.`);
    }

    this.deployments.set(deployment.id, cloneDeployment(deployment));
    return cloneDeployment(deployment);
  }

  async get(id: string): Promise<FineTuningDeployment | undefined> {
    const deployment = this.deployments.get(id);
    return deployment ? cloneDeployment(deployment) : undefined;
  }

  async list(): Promise<FineTuningDeployment[]> {
    return [...this.deployments.values()].map(cloneDeployment);
  }

  async update(
    id: string,
    changes: Partial<
      Pick<FineTuningDeployment, "status" | "endpoint" | "error">
    >
  ): Promise<FineTuningDeployment> {
    const existing = this.deployments.get(id);

    if (!existing) throw new Error(`Deployment '${id}' not found.`);

    const updated: FineTuningDeployment = {
      ...existing,
      ...changes,
      id: existing.id,
      jobId: existing.jobId,
      model: existing.model,
      createdAt: existing.createdAt,
      updatedAt: new Date()
    };

    this.deployments.set(id, cloneDeployment(updated));
    return cloneDeployment(updated);
  }

  async delete(id: string): Promise<boolean> {
    const existing = this.deployments.get(id);
    if (!existing) return false;

    this.deployments.set(id, {
      ...existing,
      status: "deleted",
      updatedAt: new Date()
    });

    return true;
  }
}
