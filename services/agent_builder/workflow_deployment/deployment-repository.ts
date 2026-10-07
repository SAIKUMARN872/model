import {
  CreateWorkflowDeploymentInput,
  UpdateWorkflowDeploymentInput,
  WorkflowDeployment,
} from "./deployment-schema.js";

export interface WorkflowDeploymentRepository {
  create(
    input: CreateWorkflowDeploymentInput,
  ): WorkflowDeployment;

  findById(id: string): WorkflowDeployment | undefined;

  findByWorkflowId(workflowId: string): WorkflowDeployment[];

  findAll(): WorkflowDeployment[];

  update(
    id: string,
    input: UpdateWorkflowDeploymentInput,
  ): WorkflowDeployment | undefined;

  delete(id: string): boolean;
}

export class InMemoryWorkflowDeploymentRepository
  implements WorkflowDeploymentRepository
{
  private readonly deployments =
    new Map<string, WorkflowDeployment>();

  create(
    input: CreateWorkflowDeploymentInput,
  ): WorkflowDeployment {
    const now = new Date().toISOString();

    const deployment: WorkflowDeployment = {
      id: `workflow_deployment_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`,
      workflowId: input.workflowId,
      versionId: input.versionId,
      environment: input.environment,
      status: "pending",
      endpoint: input.endpoint,
      createdAt: now,
      updatedAt: now,
    };

    this.deployments.set(deployment.id, deployment);

    return structuredClone(deployment);
  }

  findById(id: string): WorkflowDeployment | undefined {
    const deployment = this.deployments.get(id);

    return deployment
      ? structuredClone(deployment)
      : undefined;
  }

  findByWorkflowId(
    workflowId: string,
  ): WorkflowDeployment[] {
    return Array.from(this.deployments.values())
      .filter(
        (deployment) =>
          deployment.workflowId === workflowId,
      )
      .map((deployment) => structuredClone(deployment));
  }

  findAll(): WorkflowDeployment[] {
    return Array.from(this.deployments.values()).map(
      (deployment) => structuredClone(deployment),
    );
  }

  update(
    id: string,
    input: UpdateWorkflowDeploymentInput,
  ): WorkflowDeployment | undefined {
    const existing = this.deployments.get(id);

    if (!existing) {
      return undefined;
    }

    const now = new Date().toISOString();

    const updated: WorkflowDeployment = {
      ...existing,
      ...(input.status !== undefined
        ? { status: input.status }
        : {}),
      ...(input.endpoint !== undefined
        ? { endpoint: input.endpoint }
        : {}),
      ...(input.error !== undefined
        ? { error: input.error }
        : {}),
      ...(input.status === "deployed"
        ? { deployedAt: now }
        : {}),
      updatedAt: now,
    };

    this.deployments.set(id, updated);

    return structuredClone(updated);
  }

  delete(id: string): boolean {
    return this.deployments.delete(id);
  }
}
