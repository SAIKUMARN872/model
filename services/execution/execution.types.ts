export type ExecutionStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface CreateExecutionInput {
  task: string;
  input?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  maxAttempts?: number;
}

export interface ExecutionRecord {
  id: string;
  task: string;
  input: Record<string, unknown>;
  metadata: Record<string, unknown>;
  status: ExecutionStatus;
  attempts: number;
  maxAttempts: number;
  result?: unknown;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ExecutionResult {
  id: string;
  status: ExecutionStatus;
  result?: unknown;
  error?: string;
  durationMs?: number;
}

export interface ExecutionFilter {
  status?: ExecutionStatus;
  task?: string;
  limit?: number;
  offset?: number;
}

export type ExecutionHandler = (
  input: Record<string, unknown>,
  execution: ExecutionRecord
) => Promise<unknown> | unknown;
