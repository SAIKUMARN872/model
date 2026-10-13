import type { Collection } from "../knowledge.types.js";
import { clone } from "../knowledge.types.js";

export class CollectionRepository {
    private readonly records = new Map<string, Collection>();

    async create(record: Collection): Promise<Collection> {
        if (this.records.has(record.id)) throw new Error("Collection already exists");
        this.records.set(record.id, clone(record));
        return clone(record);
    }

    async getById(id: string): Promise<Collection | null> {
        const value = this.records.get(id);
        return value ? clone(value) : null;
    }

    async getAll(): Promise<Collection[]> {
        return [...this.records.values()].map(clone);
    }

    async update(record: Collection): Promise<Collection> {
        if (!this.records.has(record.id)) throw new Error("Collection not found");
        this.records.set(record.id, clone(record));
        return clone(record);
    }

    async delete(id: string): Promise<boolean> {
        return this.records.delete(id);
    }
}
