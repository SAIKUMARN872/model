export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface JobRecord<T> {
  id: string;
  status: JobStatus;
  payload: T;
  result?: unknown;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class JobManager<T> {
  private readonly jobs = new Map<string, JobRecord<T>>();

  create(id: string, payload: T): JobRecord<T> {
    if (this.jobs.has(id)) throw new Error(`Job already exists: ${id}`);
    const now = new Date();
    const job: JobRecord<T> = {
      id,
      status: "queued",
      payload,
      createdAt: now,
      updatedAt: now,
    };
    this.jobs.set(id, job);
    return { ...job };
  }

  get(id: string): JobRecord<T> | undefined {
    const job = this.jobs.get(id);
    return job ? { ...job } : undefined;
  }

  update(id: string, status: JobStatus, values: Partial<Pick<JobRecord<T>, "result" | "error">> = {}): JobRecord<T> {
    const job = this.jobs.get(id);
    if (!job) throw new Error(`Job not found: ${id}`);
    const updated: JobRecord<T> = {
      ...job,
      ...values,
      status,
      updatedAt: new Date(),
    };
    this.jobs.set(id, updated);
    return { ...updated };
  }

  list(): JobRecord<T>[] {
    return [...this.jobs.values()].map((job) => ({ ...job }));
  }

  delete(id: string): boolean {
    return this.jobs.delete(id);
  }
}
