export type JobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface AgentJob {
  id: string;
  tenantId: string;
  agentId: string;
  name: string;
  input?: unknown;
  output?: unknown;
  error?: string;
  status: JobStatus;
  priority: number;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CreateAgentJobInput {
  tenantId: string;
  agentId: string;
  name: string;
  input?: unknown;
  priority?: number;
}

