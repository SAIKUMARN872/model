export type DeploymentStatus =
  | "pending"
  | "deploying"
  | "deployed"
  | "failed"
  | "rolled_back";

export interface AgentDeployment {
  id: string;
  agentId: string;
  versionId?: string;
  environment: string;
  status: DeploymentStatus;
  endpoint?: string;
  error?: string;
  deployedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeploymentInput {
  agentId: string;
  versionId?: string;
  environment: string;
  endpoint?: string;
}

export interface UpdateDeploymentInput {
  status?: DeploymentStatus;
  endpoint?: string;
  error?: string;
}

