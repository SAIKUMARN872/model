import type { CreateDocumentInput, KnowledgeDocument } from "../knowledge.types.js";

export function validateDocument(input: CreateDocumentInput): CreateDocumentInput {
    if (!input || typeof input.collectionId !== "string" || !input.collectionId.trim()) {
        throw new Error("collectionId is required");
    }

    if (typeof input.title !== "string" || !input.title.trim()) {
        throw new Error("Document title is required");
    }

    if (typeof input.content !== "string" || !input.content.trim()) {
        throw new Error("Document content is required");
    }

    if (input.metadata !== undefined &&
        (typeof input.metadata !== "object" || input.metadata === null || Array.isArray(input.metadata))) {
        throw new Error("Document metadata must be an object");
    }

    return {
        ...structuredClone(input),
        title: input.title.trim(),
        metadata: structuredClone(input.metadata ?? {})
    };
}

export function validateDocumentRecord(record: KnowledgeDocument): KnowledgeDocument {
    if (!record.id || !record.collectionId || !record.title) {
        throw new Error("Invalid document record");
    }
    return structuredClone(record);
}
