export type ExecutionStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface AgentExecution {
  id: string;
  agentId: string;
  input?: unknown;
  output?: unknown;
  status: ExecutionStatus;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExecutionInput {
  agentId: string;
  input?: unknown;
}

export interface UpdateExecutionInput {
  status?: ExecutionStatus;
  output?: unknown;
  error?: string;
}

