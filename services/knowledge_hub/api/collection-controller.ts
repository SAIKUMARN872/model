import { CollectionRepository } from "../repository/collection-repository.js";
import type { Collection, CreateCollectionInput } from "../knowledge.types.js";
import { createId, now } from "../knowledge.types.js";
import { validateCollection } from "../schemas/collection-schema.js";

export class CollectionController {
    constructor(private readonly repository = new CollectionRepository()) {}

    async create(input: CreateCollectionInput): Promise<Collection> {
        const valid = validateCollection(input);
        const timestamp = now();
        return this.repository.create({
            id: createId(),
            name: valid.name,
            description: valid.description ?? "",
            metadata: structuredClone(valid.metadata ?? {}),
            createdAt: timestamp,
            updatedAt: timestamp
        });
    }

    getById(id: string) { return this.repository.getById(id); }
    getAll() { return this.repository.getAll(); }
    delete(id: string) { return this.repository.delete(id); }
}
