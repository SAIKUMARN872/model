import type { ProcessingJob } from "../jobs/processing-job.js";
import { ProcessingService } from "../processing-service.js";

export class ProcessingWorker {
  constructor(private readonly service = new ProcessingService()) {}

  async handle(job: ProcessingJob) {
    return this.service.process(job.assetId);
  }
}
