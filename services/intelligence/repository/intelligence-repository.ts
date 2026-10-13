import type { IntelligenceRecord } from "../intelligence.types.js";
import { cloneRecord } from "../intelligence.types.js";

export interface IntelligenceRepository {
    create(record: IntelligenceRecord): Promise<IntelligenceRecord>;
    getById(id: string): Promise<IntelligenceRecord | null>;
    getAll(): Promise<IntelligenceRecord[]>;
    update(record: IntelligenceRecord): Promise<IntelligenceRecord>;
    delete(id: string): Promise<boolean>;
}

export class InMemoryIntelligenceRepository
implements IntelligenceRepository {
    private readonly records = new Map<string, IntelligenceRecord>();

    async create(record: IntelligenceRecord): Promise<IntelligenceRecord> {
        if (this.records.has(record.id)) {
            throw new Error(`Intelligence record already exists: ${record.id}`);
        }

        this.records.set(record.id, cloneRecord(record));
        return cloneRecord(record);
    }

    async getById(id: string): Promise<IntelligenceRecord | null> {
        const record = this.records.get(id);
        return record ? cloneRecord(record) : null;
    }

    async getAll(): Promise<IntelligenceRecord[]> {
        return [...this.records.values()].map(cloneRecord);
    }

    async update(record: IntelligenceRecord): Promise<IntelligenceRecord> {
        if (!this.records.has(record.id)) {
            throw new Error(`Intelligence record not found: ${record.id}`);
        }

        this.records.set(record.id, cloneRecord(record));
        return cloneRecord(record);
    }

    async delete(id: string): Promise<boolean> {
        return this.records.delete(id);
    }
}
