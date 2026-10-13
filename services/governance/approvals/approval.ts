import type { GovernanceId, GovernanceStatus, Timestamped } from "../governance.types.js";

export interface ApprovalRequest extends Timestamped {
    id: GovernanceId;
    subject: string;
    requestedBy: string;
    approvers: string[];
    status: GovernanceStatus;
    decisions: Record<string, "approved" | "rejected">;
    comment?: string;
}

export function createApproval(
    input: Pick<ApprovalRequest, "id" | "subject" | "requestedBy" | "approvers">,
    now = new Date().toISOString()
): ApprovalRequest {
    if (!input.subject.trim()) throw new Error("Approval subject is required");
    if (!input.requestedBy.trim()) throw new Error("Requester is required");
    if (input.approvers.length === 0) throw new Error("At least one approver is required");

    return {
        ...input,
        approvers: [...new Set(input.approvers)],
        status: "pending",
        decisions: {},
        createdAt: now,
        updatedAt: now
    };
}
