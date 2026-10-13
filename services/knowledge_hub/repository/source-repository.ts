import type { KnowledgeSource } from "../knowledge.types.js";
import { clone } from "../knowledge.types.js";

export class SourceRepository {
    private readonly records = new Map<string, KnowledgeSource>();

    async create(record: KnowledgeSource): Promise<KnowledgeSource> {
        if (this.records.has(record.id)) throw new Error("Source already exists");
        this.records.set(record.id, clone(record));
        return clone(record);
    }

    async getById(id: string): Promise<KnowledgeSource | null> {
        const value = this.records.get(id);
        return value ? clone(value) : null;
    }

    async getAll(): Promise<KnowledgeSource[]> {
        return [...this.records.values()].map(clone);
    }

    async update(record: KnowledgeSource): Promise<KnowledgeSource> {
        if (!this.records.has(record.id)) throw new Error("Source not found");
        this.records.set(record.id, clone(record));
        return clone(record);
    }

    async delete(id: string): Promise<boolean> {
        return this.records.delete(id);
    }
}
