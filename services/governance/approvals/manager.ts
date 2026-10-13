import type { ApprovalRequest } from "./approval.js";

export class ApprovalManager {
    private readonly approvals = new Map<string, ApprovalRequest>();

    create(approval: ApprovalRequest): ApprovalRequest {
        if (this.approvals.has(approval.id)) throw new Error("Approval already exists");
        this.approvals.set(approval.id, structuredClone(approval));
        return structuredClone(approval);
    }

    get(id: string): ApprovalRequest | undefined {
        const approval = this.approvals.get(id);
        return approval ? structuredClone(approval) : undefined;
    }

    list(): ApprovalRequest[] {
        return [...this.approvals.values()].map((item) => structuredClone(item));
    }

    decide(
        id: string,
        actor: string,
        decision: "approved" | "rejected",
        comment?: string
    ): ApprovalRequest {
        const approval = this.approvals.get(id);
        if (!approval) throw new Error("Approval not found");
        if (approval.status !== "pending") throw new Error("Approval is not pending");
        if (!approval.approvers.includes(actor)) throw new Error("Actor is not an approver");

        approval.decisions[actor] = decision;
        if (comment !== undefined) approval.comment = comment;
        const decisions = Object.values(approval.decisions);

        if (decision === "rejected") {
            approval.status = "rejected";
        } else if (approval.approvers.every((approver) => approval.decisions[approver] === "approved")) {
            approval.status = "approved";
        } else if (decisions.length > 0) {
            approval.status = "pending";
        }

        approval.updatedAt = new Date().toISOString();
        return structuredClone(approval);
    }
}
