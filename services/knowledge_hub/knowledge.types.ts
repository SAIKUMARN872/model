export type EntityStatus = "active" | "inactive";
export type JobStatus = "pending" | "running" | "completed" | "failed";

export interface Collection {
    id: string;
    name: string;
    description: string;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface KnowledgeDocument {
    id: string;
    collectionId: string;
    title: string;
    content: string;
    status: EntityStatus;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface KnowledgeSource {
    id: string;
    name: string;
    type: string;
    uri: string;
    status: EntityStatus;
    createdAt: string;
    updatedAt: string;
}

export interface DocumentChunk {
    id: string;
    documentId: string;
    content: string;
    index: number;
    embedding?: number[];
    metadata: Record<string, unknown>;
}

export interface KnowledgeJob {
    id: string;
    type: "ingestion" | "indexing" | "embedding" | "sync";
    status: JobStatus;
    payload: Record<string, unknown>;
    error?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCollectionInput {
    name: string;
    description?: string;
    metadata?: Record<string, unknown>;
}

export interface CreateDocumentInput {
    collectionId: string;
    title: string;
    content: string;
    metadata?: Record<string, unknown>;
}

export interface CreateSourceInput {
    name: string;
    type: string;
    uri: string;
}

export function clone<T>(value: T): T {
    return structuredClone(value);
}

export function createId(): string {
    return globalThis.crypto.randomUUID();
}

export function now(): string {
    return new Date().toISOString();
}
