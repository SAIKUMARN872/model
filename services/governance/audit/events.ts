import type { GovernanceId } from "../governance.types.js";

export type AuditEventType =
    | "access.granted"
    | "access.denied"
    | "approval.created"
    | "approval.decided"
    | "policy.changed"
    | "model.registered"
    | "risk.assessed"
    | "workflow.completed"
    | "custom";

export interface AuditEvent {
    id: GovernanceId;
    type: AuditEventType;
    actor: string;
    resource: string;
    timestamp: string;
    details: Record<string, unknown>;
}

export function createAuditEvent(
    input: Omit<AuditEvent, "timestamp">,
    timestamp = new Date().toISOString()
): AuditEvent {
    if (!input.actor.trim()) throw new Error("Audit actor is required");
    if (!input.resource.trim()) throw new Error("Audit resource is required");
    return { ...input, details: structuredClone(input.details), timestamp };
}
