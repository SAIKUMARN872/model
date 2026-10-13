import {
  AgentDeployment,
  CreateDeploymentInput,
  DeploymentStatus,
  UpdateDeploymentInput,
} from "./deployment-schema.js";

import {
  DeploymentRepository,
  InMemoryDeploymentRepository,
} from "./deployment-repository.js";

export class DeploymentNotFoundError extends Error {
  constructor(id: string) {
    super(`Deployment not found: ${id}`);
    this.name = "DeploymentNotFoundError";
  }
}

export class InvalidDeploymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDeploymentError";
  }
}

export class AgentDeploymentService {
  constructor(
    private readonly repository: DeploymentRepository =
      new InMemoryDeploymentRepository(),
  ) {}

  create(
    input: CreateDeploymentInput,
  ): AgentDeployment {
    if (
      !input ||
      typeof input.agentId !== "string" ||
      input.agentId.trim().length === 0
    ) {
      throw new InvalidDeploymentError(
        "Agent id is required",
      );
    }

    if (
      typeof input.environment !== "string" ||
      input.environment.trim().length === 0
    ) {
      throw new InvalidDeploymentError(
        "Deployment environment is required",
      );
    }

    return this.repository.create({
      agentId: input.agentId.trim(),
      versionId: input.versionId?.trim(),
      environment:
        input.environment.trim(),
      endpoint: input.endpoint?.trim(),
    });
  }

  getById(id: string): AgentDeployment {
    this.validateId(id);

    const deployment =
      this.repository.findById(id);

    if (!deployment) {
      throw new DeploymentNotFoundError(id);
    }

    return deployment;
  }

  list(): AgentDeployment[] {
    return this.repository.findAll();
  }

  listByAgentId(
    agentId: string,
  ): AgentDeployment[] {
    if (
      typeof agentId !== "string" ||
      agentId.trim().length === 0
    ) {
      throw new InvalidDeploymentError(
        "Agent id is required",
      );
    }

    return this.repository.findByAgentId(
      agentId.trim(),
    );
  }

  update(
    id: string,
    input: UpdateDeploymentInput,
  ): AgentDeployment {
    this.validateId(id);

    if (!input || typeof input !== "object") {
      throw new InvalidDeploymentError(
        "Deployment update is required",
      );
    }

    this.validateStatus(input.status);

    if (!this.repository.findById(id)) {
      throw new DeploymentNotFoundError(id);
    }

    const updated =
      this.repository.update(id, input);

    if (!updated) {
      throw new DeploymentNotFoundError(id);
    }

    return updated;
  }

  deploy(id: string): AgentDeployment {
    return this.update(id, {
      status: "deployed",
    });
  }

  start(id: string): AgentDeployment {
    return this.update(id, {
      status: "deploying",
    });
  }

  fail(
    id: string,
    error: string,
  ): AgentDeployment {
    if (
      typeof error !== "string" ||
      error.trim().length === 0
    ) {
      throw new InvalidDeploymentError(
        "Deployment error is required",
      );
    }

    return this.update(id, {
      status: "failed",
      error: error.trim(),
    });
  }

  rollback(id: string): AgentDeployment {
    return this.update(id, {
      status: "rolled_back",
    });
  }

  delete(id: string): void {
    this.validateId(id);

    if (!this.repository.delete(id)) {
      throw new DeploymentNotFoundError(id);
    }
  }

  private validateId(id: string): void {
    if (
      typeof id !== "string" ||
      id.trim().length === 0
    ) {
      throw new InvalidDeploymentError(
        "Deployment id is required",
      );
    }
  }

  private validateStatus(
    status: DeploymentStatus | undefined,
  ): void {
    if (
      status !== undefined &&
      status !== "pending" &&
      status !== "deploying" &&
      status !== "deployed" &&
      status !== "failed" &&
      status !== "rolled_back"
    ) {
      throw new InvalidDeploymentError(
        "Invalid deployment status",
      );
    }
  }
}

