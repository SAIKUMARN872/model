import { IndexingService } from "../services/indexing-service.js";

export class IndexingWorker {
    constructor(private readonly service = new IndexingService()) {}
    process(documentId: string) { return this.service.index(documentId); }
}
