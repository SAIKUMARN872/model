import type { KnowledgeJob, JobStatus } from "../knowledge.types.js";
import { clone, createId, now } from "../knowledge.types.js";

export class JobManager {
    private readonly jobs = new Map<string, KnowledgeJob>();

    async create(
        type: KnowledgeJob["type"],
        payload: Record<string, unknown> = {}
    ): Promise<KnowledgeJob> {
        const timestamp = now();
        const job: KnowledgeJob = {
            id: createId(),
            type,
            status: "pending",
            payload: clone(payload),
            createdAt: timestamp,
            updatedAt: timestamp
        };
        this.jobs.set(job.id, job);
        return clone(job);
    }

    async get(id: string): Promise<KnowledgeJob | null> {
        const job = this.jobs.get(id);
        return job ? clone(job) : null;
    }

    async list(): Promise<KnowledgeJob[]> {
        return [...this.jobs.values()].map(clone);
    }

    async updateStatus(
        id: string,
        status: JobStatus,
        error?: string
    ): Promise<KnowledgeJob> {
        const job = this.jobs.get(id);
        if (!job) throw new Error(`Job not found: ${id}`);

        const updated: KnowledgeJob = {
            ...job,
            status,
            updatedAt: now(),
            ...(error === undefined ? {} : { error })
        };
        this.jobs.set(id, updated);
        return clone(updated);
    }
}
