import type { FineTuningJob } from "../fine-tuning.types.js";

function cloneJob(job: FineTuningJob): FineTuningJob {
  return structuredClone(job);
}

export class FineTuningRepository {
  private readonly jobs = new Map<string, FineTuningJob>();

  async create(job: FineTuningJob): Promise<FineTuningJob> {
    if (this.jobs.has(job.id)) {
      throw new Error(`Job '${job.id}' already exists.`);
    }

    this.jobs.set(job.id, cloneJob(job));
    return cloneJob(job);
  }

  async getById(id: string): Promise<FineTuningJob | undefined> {
    const job = this.jobs.get(id);
    return job ? cloneJob(job) : undefined;
  }

  async update(
    id: string,
    changes: Partial<FineTuningJob>
  ): Promise<FineTuningJob> {
    const existing = this.jobs.get(id);

    if (!existing) throw new Error(`Job '${id}' not found.`);

    const updated: FineTuningJob = {
      ...existing,
      ...changes,
      id: existing.id,
      datasetId: existing.datasetId,
      createdAt: existing.createdAt,
      updatedAt: new Date()
    };

    this.jobs.set(id, cloneJob(updated));
    return cloneJob(updated);
  }

  async list(): Promise<FineTuningJob[]> {
    return [...this.jobs.values()]
      .map(cloneJob)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async delete(id: string): Promise<boolean> {
    return this.jobs.delete(id);
  }

  async count(status?: FineTuningJob["status"]): Promise<number> {
    if (!status) return this.jobs.size;
    return [...this.jobs.values()].filter((job) => job.status === status).length;
  }

  async clear(): Promise<void> {
    this.jobs.clear();
  }
}
