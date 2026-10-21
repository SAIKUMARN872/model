import type {
  EnterpriseAgent,
} from "./enterprise-agent-schema.js";

export interface EnterpriseAgentRepository {
  create(agent: EnterpriseAgent): Promise<EnterpriseAgent>;
  findById(
    tenantId: string,
    id: string,
  ): Promise<EnterpriseAgent | undefined>;
  findAll(tenantId: string): Promise<EnterpriseAgent[]>;
  update(
    tenantId: string,
    id: string,
    changes: Partial<EnterpriseAgent>,
  ): Promise<EnterpriseAgent | undefined>;
  delete(tenantId: string, id: string): Promise<boolean>;
}

export class InMemoryEnterpriseAgentRepository
  implements EnterpriseAgentRepository
{
  private readonly agents = new Map<string, EnterpriseAgent>();

  async create(agent: EnterpriseAgent): Promise<EnterpriseAgent> {
    const copy = structuredClone(agent);
    this.agents.set(copy.id, copy);
    return structuredClone(copy);
  }

  async findById(
    tenantId: string,
    id: string,
  ): Promise<EnterpriseAgent | undefined> {
    const agent = this.agents.get(id);

    if (!agent || agent.tenantId !== tenantId) {
      return undefined;
    }

    return structuredClone(agent);
  }

  async findAll(tenantId: string): Promise<EnterpriseAgent[]> {
    return [...this.agents.values()]
      .filter((agent) => agent.tenantId === tenantId)
      .map((agent) => structuredClone(agent));
  }

  async update(
    tenantId: string,
    id: string,
    changes: Partial<EnterpriseAgent>,
  ): Promise<EnterpriseAgent | undefined> {
    const current = this.agents.get(id);

    if (!current || current.tenantId !== tenantId) {
      return undefined;
    }

    const updated: EnterpriseAgent = {
      ...current,
      ...structuredClone(changes),
      id: current.id,
      tenantId: current.tenantId,
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
