import { JobManager } from "./job-manager.js";

export class IngestionJob {
    constructor(private readonly jobs = new JobManager()) {}

    enqueue(sourceId: string) {
        return this.jobs.create("ingestion", { sourceId });
    }
}
