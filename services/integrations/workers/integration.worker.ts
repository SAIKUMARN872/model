import type { SyncJob } from "../integration.types.js";
import { SyncService } from "../services/sync.service.js";

export class IntegrationWorker {
    constructor(private readonly sync: SyncService) {}

    async process(
        jobId: string,
        handler: (job: SyncJob) => Promise<Record<string, unknown>>
    ): Promise<SyncJob> {
        return this.sync.run(jobId, handler);
    }
}
