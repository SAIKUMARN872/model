import { randomUUID } from "node:crypto";
import { ApprovalRequiredError, NotFoundError } from "../exceptions.js";
import type { ApprovalRecord } from "../interfaces.js";
import { approvalEvents } from "../events/approval-events.js";

export class ApprovalService {
  private readonly approvals = new Map<string, ApprovalRecord>();

  request(sessionId: string, actionId: string): ApprovalRecord {
    const record: ApprovalRecord = {
      id: randomUUID(), sessionId, actionId, status: "pending",
      requestedAt: new Date()
    };
    this.approvals.set(record.id, record);
    approvalEvents.emit("approval.requested", sessionId, record);
    return structuredClone(record);
  }

  resolve(id: string, approved: boolean, reason?: string): ApprovalRecord {
    const record = this.approvals.get(id);
    if (!record) throw new NotFoundError("Approval", id);
    if (record.status !== "pending") {
      throw new ApprovalRequiredError("Approval has already been resolved");
    }
    record.status = approved ? "approved" : "rejected";
    record.resolvedAt = new Date();
    record.reason = reason;
    approvalEvents.emit("approval.resolved", record.sessionId, record);
    return structuredClone(record);
  }

  get(id: string): ApprovalRecord {
    const record = this.approvals.get(id);
    if (!record) throw new NotFoundError("Approval", id);
    return structuredClone(record);
  }

  listBySession(sessionId: string): ApprovalRecord[] {
    return [...this.approvals.values()]
      .filter((record) => record.sessionId === sessionId)
      .map((record) => structuredClone(record));
  }
}
