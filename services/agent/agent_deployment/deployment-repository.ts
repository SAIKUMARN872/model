import {
  AgentDeployment,
  CreateDeploymentInput,
  UpdateDeploymentInput,
} from "./deployment-schema.js";

export interface DeploymentRepository {
  create(input: CreateDeploymentInput): AgentDeployment;
  findById(id: string): AgentDeployment | undefined;
  findByAgentId(agentId: string): AgentDeployment[];
  findAll(): AgentDeployment[];
  update(
    id: string,
    input: UpdateDeploymentInput,
  ): AgentDeployment | undefined;
  delete(id: string): boolean;
}

export class InMemoryDeploymentRepository
  implements DeploymentRepository
{
  private readonly deployments =
    new Map<string, AgentDeployment>();

  create(
    input: CreateDeploymentInput,
  ): AgentDeployment {
    const now = new Date().toISOString();

    const deployment: AgentDeployment = {
      id: `deployment_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`,
      agentId: input.agentId,
      versionId: input.versionId,
      environment: input.environment,
      status: "pending",
      endpoint: input.endpoint,
      createdAt: now,
      updatedAt: now,
    };

    this.deployments.set(
      deployment.id,
      deployment,
    );

    return { ...deployment };
  }

  findById(
    id: string,
  ): AgentDeployment | undefined {
    const deployment =
      this.deployments.get(id);

    return deployment
      ? { ...deployment }
      : undefined;
  }

  findByAgentId(
    agentId: string,
  ): AgentDeployment[] {
    return Array.from(
      this.deployments.values(),
    )
      .filter(
        (deployment) =>
          deployment.agentId === agentId,
      )
      .map((deployment) => ({
        ...deployment,
      }));
  }

  findAll(): AgentDeployment[] {
    return Array.from(
      this.deployments.values(),
    ).map((deployment) => ({
      ...deployment,
    }));
  }

  update(
    id: string,
    input: UpdateDeploymentInput,
  ): AgentDeployment | undefined {
    const existing =
      this.deployments.get(id);

    if (!existing) {
      return undefined;
    }

    const now = new Date().toISOString();

    const updated: AgentDeployment = {
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
      deployedAt:
        input.status === "deployed"
          ? now
          : existing.deployedAt,
      updatedAt: now,
    };

    this.deployments.set(id, updated);

    return { ...updated };
  }

  delete(id: string): boolean {
    return this.deployments.delete(id);
  }
}

