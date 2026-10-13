export type IntelligenceStatus = "active" | "inactive";

export interface IntelligenceRecord {
    id: string;
    name: string;
    description: string;
    status: IntelligenceStatus;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface CreateIntelligenceInput {
    name: string;
    description?: string;
    metadata?: Record<string, unknown>;
}

export interface UpdateIntelligenceInput {
    name?: string;
    description?: string;
    status?: IntelligenceStatus;
    metadata?: Record<string, unknown>;
}

export function cloneRecord<T>(value: T): T {
    return structuredClone(value);
}
