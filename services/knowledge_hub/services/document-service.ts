import type { CreateDocumentInput, KnowledgeDocument } from "../knowledge.types.js";
import { clone, createId, now } from "../knowledge.types.js";
import { DocumentRepository } from "../repository/document-repository.js";
import { CollectionRepository } from "../repository/collection-repository.js";
import { validateDocument } from "../schemas/document-schema.js";
import { defaultKnowledgeHubConfig } from "../config/config.js";
import { defaultKnowledgeHubSettings } from "../config/settings.js";
import { DocumentEventBus } from "../events/document-events.js";

export class DocumentService {
    constructor(
        private readonly documents = new DocumentRepository(),
        private readonly collections = new CollectionRepository(),
        private readonly events = new DocumentEventBus()
    ) {}

    async create(input: CreateDocumentInput): Promise<KnowledgeDocument> {
        if (!defaultKnowledgeHubSettings.allowDocumentCreation) {
            throw new Error("Document creation is disabled");
        }

        const valid = validateDocument(input);
        const collection = await this.collections.getById(valid.collectionId);
        if (!collection) throw new Error(`Collection not found: ${valid.collectionId}`);

        if ((await this.documents.getAll()).length >= defaultKnowledgeHubConfig.maxDocuments) {
            throw new Error("Maximum document count reached");
        }

        const timestamp = now();
        const document: KnowledgeDocument = {
            id: createId(),
            collectionId: valid.collectionId,
            title: valid.title,
            content: valid.content,
            status: "active",
            metadata: clone(valid.metadata ?? {}),
            createdAt: timestamp,
            updatedAt: timestamp
        };

        const created = await this.documents.create(document);
        await this.events.emit({
            type: "document.created",
            documentId: created.id,
            timestamp
        });
        return created;
    }

    getById(id: string) {
        return this.documents.getById(id);
    }

    getAll() {
        return this.documents.getAll();
    }

    async update(id: string, changes: Partial<CreateDocumentInput>): Promise<KnowledgeDocument> {
        const current = await this.documents.getById(id);
        if (!current) throw new Error(`Document not found: ${id}`);

        const updated: KnowledgeDocument = {
            ...current,
            ...(changes.title === undefined ? {} : { title: changes.title.trim() }),
            ...(changes.content === undefined ? {} : { content: changes.content }),
            ...(changes.metadata === undefined ? {} : { metadata: clone(changes.metadata) }),
            updatedAt: now()
        };

        if (!updated.title || !updated.content.trim()) {
            throw new Error("Document title and content are required");
        }

        const saved = await this.documents.update(updated);
        await this.events.emit({
            type: "document.updated",
            documentId: id,
            timestamp: saved.updatedAt
        });
        return saved;
    }

    async delete(id: string): Promise<boolean> {
        if (!defaultKnowledgeHubSettings.allowDocumentDeletion) {
            throw new Error("Document deletion is disabled");
        }
        const deleted = await this.documents.delete(id);
        if (deleted) {
            await this.events.emit({
                type: "document.deleted",
                documentId: id,
                timestamp: now()
            });
        }
        return deleted;
    }
}
