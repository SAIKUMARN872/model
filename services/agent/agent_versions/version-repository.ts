import {
  AgentVersion,
  CreateVersionInput,
  UpdateVersionInput,
} from "./version-schema.js";

export interface VersionRepository {
  create(input: CreateVersionInput): AgentVersion;
  findById(id: string): AgentVersion | undefined;
  findByAgentId(agentId: string): AgentVersion[];
  findAll(): AgentVersion[];
  update(
    id: string,
    input: UpdateVersionInput,
  ): AgentVersion | undefined;
  delete(id: string): boolean;
}

export class InMemoryVersionRepository
  implements VersionRepository
{
  private readonly versions =
    new Map<string, AgentVersion>();

  create(
    input: CreateVersionInput,
  ): AgentVersion {
    const now = new Date().toISOString();

    const version: AgentVersion = {
      id: `version_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`,
      agentId: input.agentId,
      version: input.version,
      description: input.description,
      configuration: input.configuration,
      status: input.status ?? "draft",
      createdAt: now,
      updatedAt: now,
    };

    this.versions.set(version.id, version);

    return {
      ...version,
      configuration: version.configuration
        ? { ...version.configuration }
        : undefined,
    };
  }

  findById(
    id: string,
  ): AgentVersion | undefined {
    const version = this.versions.get(id);

    return version
      ? {
          ...version,
          configuration:
            version.configuration
              ? { ...version.configuration }
              : undefined,
        }
      : undefined;
  }

  findByAgentId(
    agentId: string,
  ): AgentVersion[] {
    return Array.from(
      this.versions.values(),
    )
      .filter(
        (version) =>
          version.agentId === agentId,
      )
      .map((version) => ({
        ...version,
        configuration:
          version.configuration
            ? { ...version.configuration }
            : undefined,
      }));
  }

  findAll(): AgentVersion[] {
    return Array.from(
      this.versions.values(),
    ).map((version) => ({
      ...version,
      configuration:
        version.configuration
          ? { ...version.configuration }
          : undefined,
    }));
  }

  update(
    id: string,
    input: UpdateVersionInput,
  ): AgentVersion | undefined {
    const existing =
      this.versions.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: AgentVersion = {
      ...existing,
      ...(input.version !== undefined
        ? { version: input.version }
        : {}),
      ...(input.description !== undefined
        ? { description: input.description }
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
      updatedAt: new Date().toISOString(),
    };

    this.versions.set(id, updated);

    return {
      ...updated,
      configuration:
        updated.configuration
          ? { ...updated.configuration }
          : undefined,
    };
  }

  delete(id: string): boolean {
    return this.versions.delete(id);
  }
}

