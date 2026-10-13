export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

export interface AgentContext {
  tenantId?: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

export interface PaginationInput {
  limit?: number;
  offset?: number;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface RepositoryOptions {
  tenantId?: string;
}

