import type { SessionRecord } from "../interfaces.js";
import { SessionService } from "../services/session-service.js";
import { createSessionJob } from "../jobs/session-job.js";

export class SessionWorker {
  constructor(private readonly sessions: SessionService) {}

  run(sessionId: string, operation: "start" | "pause" | "resume" | "close"): SessionRecord {
    createSessionJob(sessionId, operation);
    switch (operation) {
      case "start": return this.sessions.start(sessionId);
      case "pause": return this.sessions.pause(sessionId);
      case "resume": return this.sessions.resume(sessionId);
      case "close": return this.sessions.close(sessionId);
    }
  }
}
