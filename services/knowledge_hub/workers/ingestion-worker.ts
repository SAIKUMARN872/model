import { IngestionService } from "../services/ingestion-service.js";

export class IngestionWorker {
    constructor(private readonly service = new IngestionService()) {}
    process(sourceId: string, collectionId: string) {
        return this.service.ingest(sourceId, collectionId);
    }
}
