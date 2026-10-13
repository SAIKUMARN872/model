export interface MemoryRecord {
  id: string;
  key: string;
  value: unknown;
  metadata: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface CreateMemoryInput {
  key: string;
  value: unknown;
  metadata?: Record<string, unknown>;
}

export interface UpdateMemoryInput {
  value?: unknown;
  metadata?: Record<string, unknown>;
}
