import { NotFoundError, ValidationError, ApprovalRequiredError, InvalidStateError } from "../exceptions.js";
import { createAction } from "../models.js";
import { validateAction } from "../schemas.js";
import type { ActionExecutor, ActionInput, ActionRecord, ComputerDevice, SessionRecord } from "../interfaces.js";
import { ActionRepository } from "../repository/action-repository.js";
import { actionEvents } from "../events/action-events.js";
import { loadComputerUseConfig } from "../config/config.js";

export class ActionService {
  constructor(
    private readonly actions = new ActionRepository(),
    private readonly config = loadComputerUseConfig(),
    private readonly executor?: ActionExecutor
  ) {}

  async execute(
    computer: ComputerDevice,
    session: SessionRecord,
    input: ActionInput,
    approved = false
  ): Promise<ActionRecord> {
    validateAction(input);
    if (session.computerId !== computer.id) {
      throw new ValidationError("Session belongs to a different computer");
    }
    if (session.status !== "active") {
      throw new InvalidStateError("Session must be active to execute actions");
    }
    if ((this.config.requireApproval || input.requiresApproval) && !approved) {
      throw new ApprovalRequiredError();
    }
    const record = createAction(session.id, input);
    record.status = "running";
    this.actions.save(record);
    actionEvents.emit("action.started", session.id, { actionId: record.id, type: record.type });
    try {
      record.result = this.executor
        ? await this.executor.execute(computer, session, input)
        : { accepted: true, simulated: true, action: input.type };
      record.status = "completed";
      record.completedAt = new Date();
      this.actions.save(record);
      actionEvents.emit("action.completed", session.id, { actionId: record.id });
      return record;
    } catch (error) {
      record.status = "failed";
      record.error = error instanceof Error ? error.message : String(error);
      this.actions.save(record);
      actionEvents.emit("action.failed", session.id, { actionId: record.id, error: record.error });
      throw error;
    }
  }

  get(id: string): ActionRecord {
    const action = this.actions.get(id);
    if (!action) throw new NotFoundError("Action", id);
    return action;
  }

  listBySession(sessionId: string): ActionRecord[] {
    return this.actions.listBySession(sessionId);
  }
}

