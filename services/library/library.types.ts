export type LibraryFile = {
  id: string;
  name: string;
  path: string;
  mimeType: string;
  size: number;
  folderId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type LibraryFolder = {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateFileInput = {
  name: string;
  path: string;
  mimeType?: string;
  size?: number;
  folderId?: string;
  metadata?: Record<string, unknown>;
};

export type CreateFolderInput = {
  name: string;
  parentId?: string;
};

export type SearchInput = {
  query: string;
  folderId?: string;
  limit?: number;
};

export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function clone<T>(value: T): T {
  return structuredClone(value);
}

export function now(): string {
  return new Date().toISOString();
}
