export type WorkflowStatus =
  | "draft"
  | "active"
  | "archived";

export interface WorkflowRecord {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  nodes: string[];
  status: WorkflowStatus;
  version: number;
  metadata: Record<string, unknown>;
  publishedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowInput {
  tenantId: string;
  name: string;
  description?: string;
  nodes?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateWorkflowInput {
  name?: string;
  description?: string;
  nodes?: string[];
  metadata?: Record<string, unknown>;
}

export interface WorkflowFilters {
  tenantId: string;
  status?: WorkflowStatus;
  limit?: number;
  offset?: number;
}
