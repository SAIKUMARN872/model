import { SyncService } from "../services/sync-service.js";

export class SyncController {
    constructor(private readonly service = new SyncService()) {}
    sync(sourceId: string) { return this.service.sync(sourceId); }
}
