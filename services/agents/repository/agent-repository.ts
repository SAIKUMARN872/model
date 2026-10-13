import type {
  Agent,
} from "../models.js";

export interface AgentRepository {
  create(agent: Agent): Promise<Agent>;
  findById(
    tenantId: string,
    id: string,
  ): Promise<Agent | undefined>;
  findAll(tenantId: string): Promise<Agent[]>;
  update(
    tenantId: string,
    id: string,
    changes: Partial<Agent>,
  ): Promise<Agent | undefined>;
  delete(
    tenantId: string,
    id: string,
  ): Promise<boolean>;
}

export class InMemoryAgentRepository
  implements AgentRepository
{
  private readonly agents = new Map<string, Agent>();

  async create(agent: Agent): Promise<Agent> {
    const copy = structuredClone(agent);
    this.agents.set(copy.id, copy);
    return structuredClone(copy);
  }

  async findById(
    tenantId: string,
    id: string,
  ): Promise<Agent | undefined> {
    const agent = this.agents.get(id);

    if (!agent || agent.tenantId !== tenantId) {
      return undefined;
    }

    return structuredClone(agent);
  }

  async findAll(tenantId: string): Promise<Agent[]> {
    return [...this.agents.values()]
      .filter((agent) => agent.tenantId === tenantId)
      .map((agent) => structuredClone(agent));
  }

  async update(
    tenantId: string,
    id: string,
    changes: Partial<Agent>,
  ): Promise<Agent | undefined> {
    const current = this.agents.get(id);

    if (!current || current.tenantId !== tenantId) {
      return undefined;
    }

    const updated: Agent = {
      ...current,
      ...structuredClone(changes),
      updatedAt: new Date().toISOString(),
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

