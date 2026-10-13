import { JobManager } from "../jobs/job-manager.js";

export class KnowledgeService {
    constructor(private readonly jobs = new JobManager()) {}

    createJob(type: "ingestion" | "indexing" | "embedding" | "sync", payload: Record<string, unknown> = {}) {
        return this.jobs.create(type, payload);
    }

    getJob(id: string) {
        return this.jobs.get(id);
    }

    listJobs() {
        return this.jobs.list();
    }
}
