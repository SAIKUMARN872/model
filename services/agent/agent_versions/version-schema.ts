export type VersionStatus =
  | "draft"
  | "active"
  | "deprecated"
  | "archived";

export interface AgentVersion {
  id: string;
  agentId: string;
  version: string;
  description?: string;
  configuration?: Record<string, unknown>;
  status: VersionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVersionInput {
  agentId: string;
  version: string;
  description?: string;
  configuration?: Record<string, unknown>;
  status?: VersionStatus;
}

export interface UpdateVersionInput {
  version?: string;
  description?: string;
  configuration?: Record<string, unknown>;
  status?: VersionStatus;
}

