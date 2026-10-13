import { ConnectionService } from "../connections/connection.service.js";
import { IntegrationJobManager } from "../jobs/integration.job.js";
import { IntegrationEventBus } from "../events/index.js";
import type { SyncJob } from "../integration.types.js";

export class SyncService {
    constructor(
        private readonly jobs = new IntegrationJobManager(),
        private readonly connections?: ConnectionService,
        private readonly events?: IntegrationEventBus
    ) {}

    enqueue(input: {
        integrationId: string;
        connectionId?: string;
        direction?: SyncJob["direction"];
        cursor?: string;
    }): SyncJob {
        if (input.connectionId) {
            const connection = this.connections?.get(input.connectionId);
            if (this.connections && !connection) throw new Error("Connection not found");
            if (connection && connection.integrationId !== input.integrationId) {
                throw new Error("Connection does not belong to integration");
            }
        }
        return this.jobs.create(input);
    }

    get(id: string): SyncJob | undefined {
        return this.jobs.get(id);
    }

    list(): SyncJob[] {
        return this.jobs.list();
    }

    async run(id: string, execute: (job: SyncJob) => Promise<Record<string, unknown>>): Promise<SyncJob> {
        const initial = this.jobs.get(id);
        if (!initial) throw new Error("Sync job not found");

        const running = this.jobs.transition(id, "running");
        await this.events?.emit({
            id: `event-${running.id}-started`,
            type: "sync.started",
            integrationId: running.integrationId,
            timestamp: new Date().toISOString(),
            payload: { jobId: running.id }
        });

        try {
            const result = await execute(running);
            const completed = this.jobs.transition(id, "succeeded", { result });

            await this.events?.emit({
                id: `event-${completed.id}-completed`,
                type: "sync.completed",
                integrationId: completed.integrationId,
                timestamp: new Date().toISOString(),
                payload: { jobId: completed.id, result }
            });

            return completed;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const failed = this.jobs.transition(id, "failed", { error: message });

            await this.events?.emit({
                id: `event-${failed.id}-failed`,
                type: "sync.failed",
                integrationId: failed.integrationId,
                timestamp: new Date().toISOString(),
                payload: { jobId: failed.id, error: message }
            });

            throw error;
        }
    }
}
