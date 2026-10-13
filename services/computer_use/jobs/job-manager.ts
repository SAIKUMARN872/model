import type { ComputerJob } from "./computer-job.js";

export class JobManager {
  private readonly jobs = new Map<string, ComputerJob<unknown>>();
  add<T>(job: ComputerJob<T>): ComputerJob<T> {
    this.jobs.set(job.id, job as ComputerJob<unknown>);
    return job;
  }
  get<T = unknown>(id: string): ComputerJob<T> | undefined {
    return this.jobs.get(id) as ComputerJob<T> | undefined;
  }
  list(): ComputerJob<unknown>[] {
    return [...this.jobs.values()];
  }
  async process<T, R>(
    job: ComputerJob<T>,
    handler: (payload: T) => Promise<R> | R
  ): Promise<R> {
    job.status = "running";
    try {
      const result = await handler(job.payload);
      job.result = result;
      job.status = "completed";
      return result;
    } catch (error) {
      job.status = "failed";
      job.error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }
}
