export interface CreateAgentInput {
  tenantId: string;
  name: string;
  description?: string;
  instructions: string;
  model?: string;
  tools?: Array<{
    name: string;
    description?: string;
    config?: Record<string, unknown>;
  }>;
  metadata?: Record<string, unknown>;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  instructions?: string;
  model?: string;
  tools?: Array<{
    name: string;
    description?: string;
    config?: Record<string, unknown>;
  }>;
  metadata?: Record<string, unknown>;
}

export interface AgentListQuery {
  tenantId: string;
}

