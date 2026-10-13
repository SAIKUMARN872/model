export type WorkflowExecutionStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  versionId?: string;
  input?: unknown;
  output?: unknown;
  status: WorkflowExecutionStatus;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowExecutionInput {
  workflowId: string;
  versionId?: string;
  input?: unknown;
}

export interface UpdateWorkflowExecutionInput {
  status?: WorkflowExecutionStatus;
  output?: unknown;
  error?: string;
}
