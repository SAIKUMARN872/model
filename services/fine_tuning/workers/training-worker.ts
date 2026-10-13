import type { FineTuningJob } from "../fine-tuning.types.js";
import type { JobService } from "../jobs/job-service.js";

export class TrainingWorker {
  constructor(
    private readonly jobs: JobService,
    private readonly trainer: (
      job: FineTuningJob,
      onProgress: (progress: number) => Promise<void>
    ) => Promise<string>
  ) {}

  async process(id: string): Promise<FineTuningJob> {
    const running = await this.jobs.start(id);

    try {
      const model = await this.trainer(running, async (progress) => {
        await this.jobs.updateProgress(id, progress);
      });

      return await this.jobs.succeed(id, model);
    } catch (error) {
      return this.jobs.fail(id, error);
    }
  }
}
