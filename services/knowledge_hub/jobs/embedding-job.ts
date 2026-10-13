import { JobManager } from "./job-manager.js";

export class EmbeddingJob {
    constructor(private readonly jobs = new JobManager()) {}

    enqueue(documentId: string) {
        return this.jobs.create("embedding", { documentId });
    }
}
