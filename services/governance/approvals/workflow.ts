import type { ApprovalRequest } from "./approval.js";
import { ApprovalManager } from "./manager.js";

export class ApprovalWorkflow {
    constructor(private readonly manager: ApprovalManager) {}

    submit(approval: ApprovalRequest): ApprovalRequest {
        return this.manager.create(approval);
    }

    approve(id: string, actor: string, comment?: string): ApprovalRequest {
        return this.manager.decide(id, actor, "approved", comment);
    }

    reject(id: string, actor: string, comment?: string): ApprovalRequest {
        return this.manager.decide(id, actor, "rejected", comment);
    }
}
