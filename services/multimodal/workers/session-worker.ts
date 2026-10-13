import type { SessionJob } from "../jobs/session-job.js";

export class SessionWorker {
  async handle(job: SessionJob) {
    return { jobId: job.id, sessionId: job.assetId, completed: true };
  }
}
