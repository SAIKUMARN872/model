import { createId } from "../utils.js";
import type { MultimodalJob } from "./multimodal-job.js";

export class JobManager {
  private jobs: MultimodalJob[] = [];

  enqueue(assetId: string, type = "processing"): MultimodalJob {
    const job = { id: createId("job"), assetId, type };
    this.jobs.push(job);
    return job;
  }

  list(): MultimodalJob[] {
    return this.jobs.map((job) => ({ ...job }));
  }
}
