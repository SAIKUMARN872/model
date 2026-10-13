import { JobManager } from "./job-manager.js";

export class SyncJob {
    constructor(private readonly jobs = new JobManager()) {}

    enqueue(sourceId: string) {
        return this.jobs.create("sync", { sourceId });
    }
}
