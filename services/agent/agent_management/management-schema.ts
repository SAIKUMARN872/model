export type AgentStatus = "active" | "inactive" | "archived";

export interface Agent {
  id: string;
  name: string;
  description?: string;
  status: AgentStatus;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentInput {
  name: string;
  description?: string;
  status?: AgentStatus;
  ownerId?: string;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  status?: AgentStatus;
  ownerId?: string;
}

