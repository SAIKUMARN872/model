export type AccessRole = "viewer" | "user" | "admin";

export interface ModelAccess {
  id: string;
  modelId: string;
  userId: string;
  role: AccessRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccessInput {
  modelId: string;
  userId: string;
  role: AccessRole;
}

export interface UpdateAccessInput {
  role?: AccessRole;
}
