import type { KnowledgeDocument } from "../knowledge.types.js";
import { clone } from "../knowledge.types.js";

export class DocumentRepository {
    private readonly records = new Map<string, KnowledgeDocument>();

    async create(record: KnowledgeDocument): Promise<KnowledgeDocument> {
        if (this.records.has(record.id)) throw new Error("Document already exists");
        this.records.set(record.id, clone(record));
        return clone(record);
    }

    async getById(id: string): Promise<KnowledgeDocument | null> {
        const value = this.records.get(id);
        return value ? clone(value) : null;
    }

    async getAll(): Promise<KnowledgeDocument[]> {
        return [...this.records.values()].map(clone);
    }

    async getByCollection(collectionId: string): Promise<KnowledgeDocument[]> {
        return [...this.records.values()]
            .filter(record => record.collectionId === collectionId)
            .map(clone);
    }

    async update(record: KnowledgeDocument): Promise<KnowledgeDocument> {
        if (!this.records.has(record.id)) throw new Error("Document not found");
        this.records.set(record.id, clone(record));
        return clone(record);
    }

    async delete(id: string): Promise<boolean> {
        return this.records.delete(id);
    }
}
