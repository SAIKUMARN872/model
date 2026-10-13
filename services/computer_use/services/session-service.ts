import { InvalidStateError, NotFoundError, ValidationError } from "../exceptions.js";
import { createSession } from "../models.js";
import type { SessionRecord, SessionStatus } from "../interfaces.js";
import { SessionRepository } from "../repository/session-repository.js";
import { sessionEvents } from "../events/session-events.js";
import { ComputerService } from "./computer-service.js";

export class SessionService {
  constructor(
    private readonly computers = new ComputerService(),
    private readonly sessions = new SessionRepository()
  ) {}

  create(computerId: string, metadata: Record<string, unknown> = {}): SessionRecord {
    const computer = this.computers.get(computerId);
    if (!computer.connected) throw new InvalidStateError("Computer is not connected");
    const session = createSession({ computerId, status: "created", metadata });
    this.sessions.save(session);
    sessionEvents.emit("session.created", session.id, { computerId });
    return session;
  }

  get(id: string): SessionRecord {
    const session = this.sessions.get(id);
    if (!session) throw new NotFoundError("Session", id);
    return session;
  }

  list(): SessionRecord[] { return this.sessions.list(); }

  transition(id: string, status: SessionStatus): SessionRecord {
    const session = this.get(id);
    const allowed: Record<SessionStatus, SessionStatus[]> = {
      created: ["active", "closed", "failed"],
      active: ["paused", "completed", "failed", "closed"],
      paused: ["active", "closed", "failed"],
      completed: [],
      failed: ["closed"],
      closed: []
    };
    if (!allowed[session.status].includes(status)) {
      throw new InvalidStateError(`Cannot transition session from ${session.status} to ${status}`);
    }
    session.status = status;
    session.updatedAt = new Date();
    this.sessions.save(session);
    sessionEvents.emit("session.status_changed", session.id, { status });
    return session;
  }

  start(id: string): SessionRecord { return this.transition(id, "active"); }
  pause(id: string): SessionRecord { return this.transition(id, "paused"); }
  resume(id: string): SessionRecord { return this.transition(id, "active"); }
  close(id: string): SessionRecord { return this.transition(id, "closed"); }
}
