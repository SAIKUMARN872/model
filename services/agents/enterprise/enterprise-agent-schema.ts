export const ENTERPRISE_AGENT_STATUSES = [
  "draft",
  "active",
  "paused",
  "archived",
] as const;

export type AgentStatus =
  (typeof ENTERPRISE_AGENT_STATUSES)[number];

export interface AgentTool {
  name: string;
  description?: string;
  config?: Record<string, unknown>;
}

export interface EnterpriseAgent {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  instructions: string;
  model: string;
  tools: AgentTool[];
  metadata: Record<string, unknown>;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnterpriseAgentInput {
  tenantId: string;
  name: string;
  description?: string;
  instructions: string;
  model?: string;
  tools?: AgentTool[];
  metadata?: Record<string, unknown>;
}

export interface UpdateEnterpriseAgentInput {
  name?: string;
  description?: string;
  instructions?: string;
  model?: string;
  tools?: AgentTool[];
  metadata?: Record<string, unknown>;
}
