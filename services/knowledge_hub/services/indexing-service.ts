import { DocumentRepository } from "../repository/document-repository.js";
import { ChunkRepository } from "../repository/chunk-repository.js";
import { createId, now } from "../knowledge.types.js";
import { defaultKnowledgeHubConfig } from "../config/config.js";
import { IndexingEventBus } from "../events/indexing-events.js";

export class IndexingService {
    constructor(
        private readonly documents = new DocumentRepository(),
        private readonly chunks = new ChunkRepository(),
        private readonly events = new IndexingEventBus()
    ) {}

    async index(documentId: string) {
        const document = await this.documents.getById(documentId);
        if (!document) throw new Error(`Document not found: ${documentId}`);

        await this.events.emit({
            type: "indexing.started",
            documentId,
            timestamp: now()
        });

        try {
            await this.chunks.deleteByDocument(documentId);
            const size = defaultKnowledgeHubConfig.chunkSize;
            const content = document.content;

            let index = 0;
            for (let offset = 0; offset < content.length; offset += size) {
                if (index >= defaultKnowledgeHubConfig.maxChunksPerDocument) {
                    throw new Error("Maximum chunks per document reached");
                }

                await this.chunks.create({
                    id: createId(),
                    documentId,
                    content: content.slice(offset, offset + size),
                    index,
                    metadata: {}
                });
                index++;
            }

            await this.events.emit({
                type: "indexing.completed",
                documentId,
                timestamp: now()
            });

            return this.chunks.getByDocument(documentId);
        } catch (error) {
            await this.events.emit({
                type: "indexing.failed",
                documentId,
                timestamp: now(),
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }
}
