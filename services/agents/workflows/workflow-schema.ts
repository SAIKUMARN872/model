export type WorkflowStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "failed"
  | "archived";

export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  status: WorkflowStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowInput {
  tenantId: string;
  name: string;
  description?: string;
  steps?: WorkflowStep[];
  metadata?: Record<string, unknown>;
}

export interface UpdateWorkflowInput {
  name?: string;
  description?: string;
  steps?: WorkflowStep[];
  metadata?: Record<string, unknown>;
}

