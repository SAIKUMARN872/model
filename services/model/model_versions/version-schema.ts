export interface ModelVersion {
  id: string;
  modelId: string;
  version: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVersionInput {
  modelId: string;
  version: string;
  description: string;
}

export interface UpdateVersionInput {
  version?: string;
  description?: string;
}
