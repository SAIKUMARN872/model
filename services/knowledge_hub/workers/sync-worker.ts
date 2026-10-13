import { SyncService } from "../services/sync-service.js";

export class SyncWorker {
    constructor(private readonly service = new SyncService()) {}
    process(sourceId: string) { return this.service.sync(sourceId); }
}
