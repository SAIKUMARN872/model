import type { CreateSourceInput, KnowledgeSource } from "../knowledge.types.js";

export function validateSource(input: CreateSourceInput): CreateSourceInput {
    if (!input || typeof input.name !== "string" || !input.name.trim()) {
        throw new Error("Source name is required");
    }
    if (typeof input.type !== "string" || !input.type.trim()) {
        throw new Error("Source type is required");
    }
    if (typeof input.uri !== "string" || !input.uri.trim()) {
        throw new Error("Source URI is required");
    }

    return {
        name: input.name.trim(),
        type: input.type.trim(),
        uri: input.uri.trim()
    };
}

export function validateSourceRecord(record: KnowledgeSource): KnowledgeSource {
    if (!record.id || !record.name || !record.uri) throw new Error("Invalid source record");
    return structuredClone(record);
}
