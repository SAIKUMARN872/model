import {
  Agent,
  CreateAgentInput,
  UpdateAgentInput,
} from "./management-schema.js";

export interface AgentManagementRepository {
  create(input: CreateAgentInput): Agent;
  findById(id: string): Agent | undefined;
  findAll(): Agent[];
  update(id: string, input: UpdateAgentInput): Agent | undefined;
  delete(id: string): boolean;
  exists(id: string): boolean;
}

export class InMemoryAgentManagementRepository
  implements AgentManagementRepository
{
  private readonly agents = new Map<string, Agent>();

  create(input: CreateAgentInput): Agent {
    const now = new Date().toISOString();

    const agent: Agent = {
      id: `agent_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      name: input.name,
      description: input.description,
      status: input.status ?? "active",
      ownerId: input.ownerId,
      createdAt: now,
      updatedAt: now,
    };

    this.agents.set(agent.id, agent);

    return { ...agent };
  }

  findById(id: string): Agent | undefined {
    const agent = this.agents.get(id);

    return agent ? { ...agent } : undefined;
  }

  findAll(): Agent[] {
    return Array.from(this.agents.values()).map((agent) => ({
      ...agent,
    }));
  }

  update(
    id: string,
    input: UpdateAgentInput,
  ): Agent | undefined {
    const existing = this.agents.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: Agent = {
      ...existing,
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.status !== undefined
        ? { status: input.status }
        : {}),
      ...(input.ownerId !== undefined
        ? { ownerId: input.ownerId }
        : {}),
      updatedAt: new Date().toISOString(),
    };

    this.agents.set(id, updated);

    return { ...updated };
  }

  delete(id: string): boolean {
    return this.agents.delete(id);
  }

  exists(id: string): boolean {
    return this.agents.has(id);
  }
}

