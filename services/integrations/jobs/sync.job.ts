import type { SyncJob } from "../integration.types.js";
import { IntegrationJobManager } from "./integration.job.js";

export class SyncJobService {
    constructor(private readonly jobs: IntegrationJobManager) {}

    enqueue(input: {
        integrationId: string;
        connectionId?: string;
        direction?: SyncJob["direction"];
        cursor?: string;
    }): SyncJob {
        return this.jobs.create(input);
    }

    get(id: string): SyncJob | undefined {
        return this.jobs.get(id);
    }

    list(): SyncJob[] {
        return this.jobs.list();
    }
}
