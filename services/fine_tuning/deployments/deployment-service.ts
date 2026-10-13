import { randomUUID } from "node:crypto";
import type { CreateDeploymentInput, FineTuningDeployment } from "../fine-tuning.types.js";
import { JobService } from "../jobs/job-service.js";
import { DeploymentManager } from "./deployment-manager.js";
import {
  createDeploymentRecord,
  validateDeploymentJobStatus
} from "./deployment-schema.js";

export class DeploymentService {
  constructor(
    private readonly jobs: JobService,
    readonly manager = new DeploymentManager(),
    private readonly idFactory: () => string = randomUUID,
    private readonly endpointFactory: (id: string) => string = (id) =>
      `https://models.example.invalid/deployments/${encodeURIComponent(id)}`
  ) {}

  async create(input: CreateDeploymentInput): Promise<FineTuningDeployment> {
    const job = await this.jobs.get(input.jobId);
    validateDeploymentJobStatus(job.status);

    const model = input.model ?? job.resultModel;

    if (!model) {
      throw new Error("No trained model is available for deployment.");
    }

    const id = this.idFactory();
    const deployment = createDeploymentRecord(
      id,
      job.id,
      model,
      this.endpointFactory(id)
    );

    return this.manager.create(deployment);
  }

  async get(id: string): Promise<FineTuningDeployment> {
    const deployment = await this.manager.get(id);
    if (!deployment) throw new Error(`Deployment '${id}' not found.`);
    return deployment;
  }

  async list(): Promise<FineTuningDeployment[]> {
    return this.manager.list();
  }

  async markReady(id: string): Promise<FineTuningDeployment> {
    const deployment = await this.get(id);

    if (deployment.status !== "creating") {
      throw new Error("Only creating deployments can become ready.");
    }

    return this.manager.update(id, { status: "ready", error: undefined });
  }

  async markFailed(id: string, error: unknown): Promise<FineTuningDeployment> {
    const message = error instanceof Error ? error.message : String(error);

    return this.manager.update(id, { status: "failed", error: message });
  }

  async delete(id: string): Promise<boolean> {
    return this.manager.delete(id);
  }
}
