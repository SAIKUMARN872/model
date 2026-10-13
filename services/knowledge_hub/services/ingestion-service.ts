import { SourceRepository } from "../repository/source-repository.js";
import { DocumentRepository } from "../repository/document-repository.js";
import { validateSource } from "../schemas/source-schema.js";
import { createId, now } from "../knowledge.types.js";
import type { CreateSourceInput, KnowledgeSource } from "../knowledge.types.js";
import { defaultKnowledgeHubSettings } from "../config/settings.js";
import { IngestionEventBus } from "../events/ingestion-events.js";

export class IngestionService {
    constructor(
        private readonly sources = new SourceRepository(),
        private readonly documents = new DocumentRepository(),
        private readonly events = new IngestionEventBus()
    ) {}

    async createSource(input: CreateSourceInput): Promise<KnowledgeSource> {
        if (!defaultKnowledgeHubSettings.allowSourceCreation) {
            throw new Error("Source creation is disabled");
        }
        const valid = validateSource(input);
        const timestamp = now();

        return this.sources.create({
            id: createId(),
            ...valid,
            status: "active",
            createdAt: timestamp,
            updatedAt: timestamp
        });
    }

    getSources() {
        return this.sources.getAll();
    }

    async ingest(sourceId: string, collectionId: string) {
        const source = await this.sources.getById(sourceId);
        if (!source) throw new Error(`Source not found: ${sourceId}`);

        await this.events.emit({
            type: "ingestion.started",
            sourceId,
            timestamp: now()
        });

        try {
            const document = await this.documents.create({
                id: createId(),
                collectionId,
                title: source.name,
                content: source.uri,
                status: "active",
                metadata: { sourceId },
                createdAt: now(),
                updatedAt: now()
            });

            await this.events.emit({
                type: "ingestion.completed",
                sourceId,
                timestamp: now()
            });

            return document;
        } catch (error) {
            await this.events.emit({
                type: "ingestion.failed",
                sourceId,
                timestamp: now(),
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }
}
