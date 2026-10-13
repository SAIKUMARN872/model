import type { Collection, CreateCollectionInput } from "../knowledge.types.js";

export function validateCollection(input: CreateCollectionInput): CreateCollectionInput {
    if (!input || typeof input.name !== "string" || !input.name.trim()) {
        throw new Error("Collection name is required");
    }

    if (input.description !== undefined && typeof input.description !== "string") {
        throw new Error("Collection description must be a string");
    }

    if (input.metadata !== undefined &&
        (typeof input.metadata !== "object" || input.metadata === null || Array.isArray(input.metadata))) {
        throw new Error("Collection metadata must be an object");
    }

    return {
        name: input.name.trim(),
        description: input.description ?? "",
        metadata: structuredClone(input.metadata ?? {})
    };
}

export function validateCollectionRecord(record: Collection): Collection {
    if (!record.id || !record.name) throw new Error("Invalid collection record");
    return structuredClone(record);
}
