import { IngestionService } from "../services/ingestion-service.js";
import type { CreateSourceInput } from "../knowledge.types.js";

export class SourceController {
    constructor(private readonly service = new IngestionService()) {}
    create(input: CreateSourceInput) { return this.service.createSource(input); }
    getAll() { return this.service.getSources(); }
}
