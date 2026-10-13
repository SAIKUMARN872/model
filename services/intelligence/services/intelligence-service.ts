import type {
    CreateIntelligenceInput,
    IntelligenceRecord,
    UpdateIntelligenceInput
} from "../intelligence.types.js";
import { cloneRecord } from "../intelligence.types.js";
import { defaultIntelligenceConfig } from "../config/config.js";
import type { IntelligenceConfig } from "../config/config.js";
import { defaultIntelligenceSettings } from "../config/settings.js";
import type { IntelligenceSettings } from "../config/settings.js";
import {
    validateCreateIntelligence,
    validateUpdateIntelligence
} from "../schemas/intelligence-schema.js";
import {
    InMemoryIntelligenceRepository
} from "../repository/intelligence-repository.js";
import type {
    IntelligenceRepository
} from "../repository/intelligence-repository.js";
import { IntelligenceEventBus } from "../events/intelligence-events.js";

export class IntelligenceService {
    constructor(
        private readonly repository: IntelligenceRepository =
            new InMemoryIntelligenceRepository(),
        private readonly events: IntelligenceEventBus =
            new IntelligenceEventBus(),
        private readonly config: IntelligenceConfig =
            defaultIntelligenceConfig,
        private readonly settings: IntelligenceSettings =
            defaultIntelligenceSettings
    ) {}

    async create(input: CreateIntelligenceInput): Promise<IntelligenceRecord> {
        if (!this.settings.allowCreate) {
            throw new Error("Creating intelligence records is disabled");
        }

        const valid = validateCreateIntelligence(input);
        const existing = await this.repository.getAll();

        if (existing.length >= this.config.maxRecords) {
            throw new Error("Maximum intelligence record count reached");
        }

        const now = new Date().toISOString();
        const record: IntelligenceRecord = {
            id: this.createId(),
            name: valid.name,
            description: valid.description ?? "",
            status: "active",
            metadata: cloneRecord(valid.metadata ?? {}),
            createdAt: now,
            updatedAt: now
        };

        const created = await this.repository.create(record);

        await this.events.emit({
            type: "intelligence.created",
            record: created,
            timestamp: now
        });

        return created;
    }

    async getById(id: string): Promise<IntelligenceRecord | null> {
        if (!id.trim()) throw new Error("id is required");
        return this.repository.getById(id);
    }

    async getAll(): Promise<IntelligenceRecord[]> {
        return this.repository.getAll();
    }

    async update(
        id: string,
        input: UpdateIntelligenceInput
    ): Promise<IntelligenceRecord> {
        if (!this.settings.allowUpdate) {
            throw new Error("Updating intelligence records is disabled");
        }

        const current = await this.repository.getById(id);
        if (!current) throw new Error(`Intelligence record not found: ${id}`);

        const valid = validateUpdateIntelligence(input);
        const updated: IntelligenceRecord = {
            ...current,
            ...valid,
            name: valid.name?.trim() ?? current.name,
            metadata: valid.metadata
                ? cloneRecord(valid.metadata)
                : current.metadata,
            updatedAt: new Date().toISOString()
        };

        const saved = await this.repository.update(updated);

        await this.events.emit({
            type: "intelligence.updated",
            record: saved,
            timestamp: saved.updatedAt
        });

        return saved;
    }

    async delete(id: string): Promise<boolean> {
        if (!this.settings.allowDelete) {
            throw new Error("Deleting intelligence records is disabled");
        }

        if (!id.trim()) throw new Error("id is required");

        const deleted = await this.repository.delete(id);

        if (deleted) {
            await this.events.emit({
                type: "intelligence.deleted",
                id,
                timestamp: new Date().toISOString()
            });
        }

        return deleted;
    }

    private createId(): string {
        return globalThis.crypto.randomUUID();
    }
}
