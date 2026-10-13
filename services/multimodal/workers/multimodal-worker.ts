import type { MultimodalJob } from "../jobs/multimodal-job.js";

export class MultimodalWorker {
  async handle(job: MultimodalJob): Promise<{ jobId: string; completed: boolean }> {
    return { jobId: job.id, completed: true };
  }
}
