import {
  AgentVersion,
  CreateVersionInput,
  UpdateVersionInput,
  VersionStatus,
} from "./version-schema.js";

import {
  VersionRepository,
  InMemoryVersionRepository,
} from "./version-repository.js";

export class VersionNotFoundError extends Error {
  constructor(id: string) {
    super(`Version not found: ${id}`);
    this.name = "VersionNotFoundError";
  }
}

export class InvalidVersionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidVersionError";
  }
}

export class AgentVersionService {
  constructor(
    private readonly repository: VersionRepository =
      new InMemoryVersionRepository(),
  ) {}

  create(
    input: CreateVersionInput,
  ): AgentVersion {
    if (
      !input ||
      typeof input.agentId !== "string" ||
      input.agentId.trim().length === 0
    ) {
      throw new InvalidVersionError(
        "Agent id is required",
      );
    }

    if (
      typeof input.version !== "string" ||
      input.version.trim().length === 0
    ) {
      throw new InvalidVersionError(
        "Version is required",
      );
    }

    if (
      input.description !== undefined &&
      typeof input.description !== "string"
    ) {
      throw new InvalidVersionError(
        "Version description must be a string",
      );
    }

    if (
      input.configuration !== undefined &&
      (
        typeof input.configuration !== "object" ||
        input.configuration === null ||
        Array.isArray(input.configuration)
      )
    ) {
      throw new InvalidVersionError(
        "Version configuration must be an object",
      );
    }

    this.validateStatus(input.status);

    return this.repository.create({
      agentId: input.agentId.trim(),
      version: input.version.trim(),
      description:
        input.description?.trim(),
      configuration:
        input.configuration
          ? { ...input.configuration }
          : undefined,
      status: input.status ?? "draft",
    });
  }

  getById(id: string): AgentVersion {
    this.validateId(id);

    const version =
      this.repository.findById(id);

    if (!version) {
      throw new VersionNotFoundError(id);
    }

    return version;
  }

  list(): AgentVersion[] {
    return this.repository.findAll();
  }

  listByAgentId(
    agentId: string,
  ): AgentVersion[] {
    this.validateId(agentId);

    return this.repository.findByAgentId(
      agentId,
    );
  }

  update(
    id: string,
    input: UpdateVersionInput,
  ): AgentVersion {
    this.validateId(id);

    if (!input || typeof input !== "object") {
      throw new InvalidVersionError(
        "Version update is required",
      );
    }

    if (
      input.version !== undefined &&
      (
        typeof input.version !== "string" ||
        input.version.trim().length === 0
      )
    ) {
      throw new InvalidVersionError(
        "Version cannot be empty",
      );
    }

    if (
      input.description !== undefined &&
      typeof input.description !== "string"
    ) {
      throw new InvalidVersionError(
        "Version description must be a string",
      );
    }

    if (
      input.configuration !== undefined &&
      (
        typeof input.configuration !== "object" ||
        input.configuration === null ||
        Array.isArray(input.configuration)
      )
    ) {
      throw new InvalidVersionError(
        "Version configuration must be an object",
      );
    }

    this.validateStatus(input.status);

    if (!this.repository.findById(id)) {
      throw new VersionNotFoundError(id);
    }

    const updated =
      this.repository.update(id, {
        ...(input.version !== undefined
          ? { version: input.version.trim() }
          : {}),
        ...(input.description !== undefined
          ? {
              description:
                input.description.trim(),
            }
          : {}),
        ...(input.configuration !== undefined
          ? {
              configuration: {
                ...input.configuration,
              },
            }
          : {}),
        ...(input.status !== undefined
          ? { status: input.status }
          : {}),
      });

    if (!updated) {
      throw new VersionNotFoundError(id);
    }

    return updated;
  }

  activate(id: string): AgentVersion {
    return this.update(id, {
      status: "active",
    });
  }

  deprecate(id: string): AgentVersion {
    return this.update(id, {
      status: "deprecated",
    });
  }

  archive(id: string): AgentVersion {
    return this.update(id, {
      status: "archived",
    });
  }

  delete(id: string): void {
    this.validateId(id);

    if (!this.repository.delete(id)) {
      throw new VersionNotFoundError(id);
    }
  }

  private validateId(id: string): void {
    if (
      typeof id !== "string" ||
      id.trim().length === 0
    ) {
      throw new InvalidVersionError(
        "Version id is required",
      );
    }
  }

  private validateStatus(
    status: VersionStatus | undefined,
  ): void {
    if (
      status !== undefined &&
      status !== "draft" &&
      status !== "active" &&
      status !== "deprecated" &&
      status !== "archived"
    ) {
      throw new InvalidVersionError(
        "Invalid version status",
      );
    }
  }
}

