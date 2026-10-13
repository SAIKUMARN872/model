import type { FineTuningJob } from "../fine-tuning.types.js";
import type { JobService } from "../jobs/job-service.js";

export class EvaluationWorker {
  constructor(
    private readonly jobs: JobService,
    private readonly evaluator: (job: FineTuningJob) => Promise<boolean> | boolean
  ) {}

  async evaluate(id: string): Promise<{ jobId: string; passed: boolean }> {
    const job = await this.jobs.get(id);

    if (job.status !== "succeeded" || !job.resultModel) {
      throw new Error("Only successfully trained jobs can be evaluated.");
    }

    return {
      jobId: id,
      passed: await this.evaluator(job)
    };
  }
}
