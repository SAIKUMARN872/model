export type WorkflowDeploymentStatus =
  | "pending"
  | "deploying"
  | "deployed"
  | "failed"
  | "rolled_back";

export interface WorkflowDeployment {
  id: string;
  workflowId: string;
  versionId?: string;
  environment: string;
  status: WorkflowDeploymentStatus;
  endpoint?: string;
  error?: string;
  deployedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowDeploymentInput {
  workflowId: string;
  versionId?: string;
  environment: string;
  endpoint?: string;
}

export interface UpdateWorkflowDeploymentInput {
  status?: WorkflowDeploymentStatus;
  endpoint?: string;
  error?: string;
}
