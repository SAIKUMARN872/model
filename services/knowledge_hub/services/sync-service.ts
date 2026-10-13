import { SourceRepository } from "../repository/source-repository.js";
import { createId, now } from "../knowledge.types.js";

export class SyncService {
    constructor(private readonly sources = new SourceRepository()) {}

    async sync(sourceId: string) {
        const source = await this.sources.getById(sourceId);
        if (!source) throw new Error(`Source not found: ${sourceId}`);

        const updated = { ...source, updatedAt: now() };
        return this.sources.update(updated);
    }

    async register(name: string, type: string, uri: string) {
        const timestamp = now();
        return this.sources.create({
            id: createId(),
            name,
            type,
            uri,
            status: "active",
            createdAt: timestamp,
            updatedAt: timestamp
        });
    }
}
