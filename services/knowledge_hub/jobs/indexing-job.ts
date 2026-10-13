import { JobManager } from "./job-manager.js";

export class IndexingJob {
    constructor(private readonly jobs = new JobManager()) {}

    enqueue(documentId: string) {
        return this.jobs.create("indexing", { documentId });
    }
}
