import { NotFoundError } from "../exceptions.js";
import type { SessionRecord, VerificationResult } from "../interfaces.js";
import { ActionService } from "./action-service.js";

export class VerificationService {
  constructor(private readonly actions = new ActionService()) {}

  verify(session: SessionRecord, actionId?: string): VerificationResult {
    const issues: string[] = [];
    if (session.status === "failed" || session.status === "closed") {
      issues.push(`Session is ${session.status}`);
    }
    if (actionId) {
      try {
        const action = this.actions.get(actionId);
        if (action.sessionId !== session.id) issues.push("Action belongs to another session");
        if (action.status !== "completed") issues.push(`Action status is ${action.status}`);
      } catch (error) {
        if (error instanceof NotFoundError) issues.push("Action not found");
        else throw error;
      }
    }
    return {
      valid: issues.length === 0,
      sessionId: session.id,
      actionId,
      checkedAt: new Date(),
      issues
    };
  }
}
