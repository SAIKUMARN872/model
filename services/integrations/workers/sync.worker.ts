import type { SyncJob } from "../integration.types.js";
import { SyncService } from "../services/sync.service.js";

export class SyncWorker {
    constructor(private readonly sync: SyncService) {}

    async processBatch(
        jobIds: readonly string[],
        handler: (job: SyncJob) => Promise<Record<string, unknown>>
    ): Promise<Array<{ jobId: string; status: "succeeded" | "failed"; error?: string }>> {
        const results: Array<{ jobId: string; status: "succeeded" | "failed"; error?: string }> = [];

        for (const jobId of jobIds) {
            try {
                await this.sync.run(jobId, handler);
                results.push({ jobId, status: "succeeded" });
            } catch (error) {
                results.push({
                    jobId,
                    status: "failed",
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        return results;
    }
}
