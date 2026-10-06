export type PermissionEffect = "allow" | "deny";

export interface AgentPermission {
  id: string;
  agentId: string;
  subjectId: string;
  resource: string;
  action: string;
  effect: PermissionEffect;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionInput {
  agentId: string;
  subjectId: string;
  resource: string;
  action: string;
  effect?: PermissionEffect;
}

export interface UpdatePermissionInput {
  resource?: string;
  action?: string;
  effect?: PermissionEffect;
}

