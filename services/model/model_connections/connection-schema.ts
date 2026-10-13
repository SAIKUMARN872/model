export interface ModelConnection {
  id: string;
  modelId: string;
  name: string;
  endpoint: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConnectionInput {
  modelId: string;
  name: string;
  endpoint: string;
}

export interface UpdateConnectionInput {
  name?: string;
  endpoint?: string;
}
