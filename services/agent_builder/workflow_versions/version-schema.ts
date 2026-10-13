export type WorkflowVersionStatus =
  | "draft"
  | "published"
  | "archived";

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  version: number;
  name?: string;
  definition: Record<string, unknown>;
  status: WorkflowVersionStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface CreateWorkflowVersionInput {
  workflowId: string;
  name?: string;
  definition: Record<string, unknown>;
}

export interface UpdateWorkflowVersionInput {
  name?: string;
  definition?: Record<string, unknown>;
}
