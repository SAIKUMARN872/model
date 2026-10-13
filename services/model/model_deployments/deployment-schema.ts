export type DeploymentStatus = "pending" | "running" | "failed" | "stopped";

export interface ModelDeployment {
  id: string;
  modelId: string;
  environment: string;
  version: string;
  status: DeploymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDeploymentInput {
  modelId: string;
  environment: string;
  version: string;
}

export interface UpdateDeploymentInput {
  environment?: string;
  version?: string;
  status?: DeploymentStatus;
}
