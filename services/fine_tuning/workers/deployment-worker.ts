import type { FineTuningDeployment } from "../fine-tuning.types.js";
import type { DeploymentService } from "../deployments/deployment-service.js";

export class DeploymentWorker {
  constructor(
    private readonly deployments: DeploymentService,
    private readonly provision: (
      deployment: FineTuningDeployment
    ) => Promise<void> | void
  ) {}

  async process(id: string): Promise<FineTuningDeployment> {
    const deployment = await this.deployments.get(id);

    if (deployment.status !== "creating") {
      throw new Error("Only creating deployments can be processed.");
    }

    try {
      await this.provision(deployment);
      return await this.deployments.markReady(id);
    } catch (error) {
      return this.deployments.markFailed(id, error);
    }
  }
}
