export type IntegrationStatus = "active" | "inactive" | "error";
export type ConnectionStatus = "connected" | "disconnected" | "connecting" | "error";
export type SyncStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";

export interface Integration {
    id: string;
    name: string;
    provider: string;
    description?: string;
    status: IntegrationStatus;
    createdAt: string;
    updatedAt: string;
    metadata: Record<string, unknown>;
}

export interface IntegrationConnection {
    id: string;
    integrationId: string;
    name: string;
    status: ConnectionStatus;
    lastConnectedAt?: string;
    lastError?: string;
    createdAt: string;
    updatedAt: string;
    metadata: Record<string, unknown>;
}

export interface IntegrationCredential {
    id: string;
    integrationId: string;
    connectionId?: string;
    kind: "api_key" | "oauth" | "basic" | "custom";
    secret: string;
    createdAt: string;
    updatedAt: string;
}

export interface SyncJob {
    id: string;
    integrationId: string;
    connectionId?: string;
    status: SyncStatus;
    direction: "import" | "export" | "bidirectional";
    cursor?: string;
    attempts: number;
    createdAt: string;
    updatedAt: string;
    error?: string;
    result?: Record<string, unknown>;
}

export function nowIso(): string {
    return new Date().toISOString();
}

export function requireText(value: string, field: string): string {
    const normalized = value.trim();
    if (!normalized) throw new Error(`${field} is required`);
    return normalized;
}

export function clone<T>(value: T): T {
    return structuredClone(value);
}
