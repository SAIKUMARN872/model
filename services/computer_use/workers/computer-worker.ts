import type { ActionInput, ActionRecord, ComputerDevice, SessionRecord } from "../interfaces.js";
import { ActionService } from "../services/action-service.js";
import { ComputerService } from "../services/computer-service.js";
import { SessionService } from "../services/session-service.js";
import { createComputerJob } from "../jobs/computer-job.js";
import { JobManager } from "../jobs/job-manager.js";

export class ComputerWorker {
  constructor(
    private readonly computers = new ComputerService(),
    private readonly sessions = new SessionService(computers),
    private readonly actions = new ActionService(),
    private readonly jobs = new JobManager()
  ) {}

  async run(computerId: string, sessionId: string, action: ActionInput, approved = false): Promise<ActionRecord> {
    const job = createComputerJob("execute_action", { computerId, sessionId, action, approved });
    this.jobs.add(job);
    return this.jobs.process(job, async (payload) => {
      const computer: ComputerDevice = this.computers.get(payload.computerId);
      const session: SessionRecord = this.sessions.get(payload.sessionId);
      return this.actions.execute(computer, session, payload.action, payload.approved);
    });
  }
}
