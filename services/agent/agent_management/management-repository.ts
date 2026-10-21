import type {
  AgentFilters,
  AgentRecord,
} from "./management-schema.js";

type AgentChanges = Partial<
  Omit<AgentRecord, "id" | "tenantId" | "createdAt">
>;

export interface AgentRepository {
  create(agent: AgentRecord): Promise<AgentRecord>;
  findById(
    tenantId: string,
    id: string,
  ): Promise<AgentRecord | undefined>;
  findAll(filters: AgentFilters): Promise<AgentRecord[]>;
  update(
    tenantId: string,
    id: string,
    expectedVersion: number,
    changes: AgentChanges,
  ): Promise<AgentRecord | undefined>;
  delete(tenantId: string, id: string): Promise<boolean>;
}

export class InMemoryAgentRepository implements AgentRepository {
  private readonly agents = new Map<string, AgentRecord>();

  async create(agent: AgentRecord): Promise<AgentRecord> {
    const copy = structuredClone(agent);
    this.agents.set(copy.id, copy);
    return structuredClone(copy);
  }

  async findById(
    tenantId: string,
    id: string,
  ): Promise<AgentRecord | undefined> {
    const agent = this.agents.get(id);

    if (!agent || agent.tenantId !== tenantId) {
      return undefined;
    }

    return structuredClone(agent);
  }

  async findAll(filters: AgentFilters): Promise<AgentRecord[]> {
    const search = filters.search?.trim().toLowerCase();

    return [...this.agents.values()]
      .filter((agent) => agent.tenantId === filters.tenantId)
      .filter(
        (agent) =>
          filters.status === undefined ||
          agent.status === filters.status,
      )
      .filter(
        (agent) =>
          filters.provider === undefined ||
          agent.model.provider === filters.provider,
      )
      .filter(
        (agent) =>
          search === undefined ||
          search.length === 0 ||
          [agent.name, agent.description, agent.instructions]
            .some((value) => value?.toLowerCase().includes(search)),
      )
      .slice(filters.offset ?? 0)
      .slice(
        0,
        filters.limit ?? Number.POSITIVE_INFINITY,
      )
      .map((agent) => structuredClone(agent));
  }

  async update(
    tenantId: string,
    id: string,
    expectedVersion: number,
    changes: AgentChanges,
  ): Promise<AgentRecord | undefined> {
    const current = this.agents.get(id);

    if (
      !current ||
      current.tenantId !== tenantId ||
      current.version !== expectedVersion
    ) {
      return undefined;
    }

    const updated: AgentRecord = {
      ...current,
      ...structuredClone(changes),
      id: current.id,
      tenantId: current.tenantId,
      createdAt: current.createdAt,
      updatedAt: changes.updatedAt ?? new Date().toISOString(),
    };

    this.agents.set(id, updated);
    return structuredClone(updated);
  }

  async delete(
    tenantId: string,
    id: string,
  ): Promise<boolean> {
    const current = this.agents.get(id);

    if (!current || current.tenantId !== tenantId) {
      return false;
    }

    return this.agents.delete(id);
  }
}
