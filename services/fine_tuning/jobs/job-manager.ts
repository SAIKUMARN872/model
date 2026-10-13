import type { FineTuningJob } from "../fine-tuning.types.js";
import type { JobService } from "./job-service.js";

export class JobManager {
  constructor(private readonly service: JobService) {}

  async submit(
    input: Parameters<JobService["create"]>[0]
  ): Promise<FineTuningJob> {
    return this.service.create(input);
  }

  async get(id: string): Promise<FineTuningJob> {
    return this.service.get(id);
  }

  async list(): Promise<FineTuningJob[]> {
    return this.service.list();
  }

  async cancel(id: string): Promise<FineTuningJob> {
    return this.service.cancel(id);
  }

  async retry(id: string): Promise<FineTuningJob> {
    return this.service.retry(id);
  }
}
