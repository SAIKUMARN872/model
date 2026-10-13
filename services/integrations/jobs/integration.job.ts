import { randomUUID } from "node:crypto";
import { nowIso, type SyncJob, type SyncStatus } from "../integration.types.js";

export class IntegrationJobManager {
    private readonly jobs = new Map<string, SyncJob>();

    constructor(private readonly idFactory: () => string = randomUUID) {}

    create(input: {
        integrationId: string;
        connectionId?: string;
        direction?: SyncJob["direction"];
        cursor?: string;
    }): SyncJob {
        if (!input.integrationId.trim()) throw new Error("integrationId is required");

        const now = nowIso();
        const job: SyncJob = {
            id: this.idFactory(),
            integrationId: input.integrationId,
            ...(input.connectionId === undefined ? {} : { connectionId: input.connectionId }),
            ...(input.cursor === undefined ? {} : { cursor: input.cursor }),
            direction: input.direction ?? "bidirectional",
            status: "queued",
            attempts: 0,
            createdAt: now,
            updatedAt: now
        };

        this.jobs.set(job.id, structuredClone(job));
        return structuredClone(job);
    }

    get(id: string): SyncJob | undefined {
        const job = this.jobs.get(id);
        return job ? structuredClone(job) : undefined;
    }

    list(): SyncJob[] {
        return [...this.jobs.values()].map((job) => structuredClone(job));
    }

    transition(id: string, status: SyncStatus, details: { error?: string; cursor?: string; result?: Record<string, unknown> } = {}): SyncJob {
        const job = this.jobs.get(id);
        if (!job) throw new Error("Integration job not found");

        const allowed: Record<SyncStatus, SyncStatus[]> = {
            queued: ["running", "cancelled"],
            running: ["succeeded", "failed", "cancelled"],
            succeeded: [],
            failed: ["queued"],
            cancelled: []
        };

        if (status !== job.status && !allowed[job.status].includes(status)) {
            throw new Error(`Invalid sync job transition: ${job.status} -> ${status}`);
        }

        job.status = status;
        job.updatedAt = nowIso();

        if (status === "running") job.attempts += 1;
        if (details.error !== undefined) job.error = details.error;
        if (details.cursor !== undefined) job.cursor = details.cursor;
        if (details.result !== undefined) job.result = structuredClone(details.result);
        if (status === "queued") delete job.error;

        return structuredClone(job);
    }
}
