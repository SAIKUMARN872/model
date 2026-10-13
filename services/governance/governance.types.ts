export type GovernanceId = string;
export type GovernanceActor = string;

export type GovernanceStatus =
    | "draft"
    | "pending"
    | "approved"
    | "rejected"
    | "active"
    | "inactive"
    | "completed"
    | "failed";

export interface Timestamped {
    createdAt: string;
    updatedAt: string;
}

export function nowIso(): string {
    return new Date().toISOString();
}

export function requireNonEmpty(value: string, field: string): string {
    const normalized = value.trim();
    if (!normalized) {
        throw new Error(`${field} must not be empty`);
    }
    return normalized;
}

export function uniqueStrings(values: readonly string[]): string[] {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
