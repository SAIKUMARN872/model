import type {
    CreateIntelligenceInput,
    IntelligenceRecord,
    UpdateIntelligenceInput
} from "../intelligence.types.js";

export function validateCreateIntelligence(
    input: CreateIntelligenceInput
): CreateIntelligenceInput {
    if (!input || typeof input.name !== "string" || !input.name.trim()) {
        throw new Error("name is required");
    }

    if (
        input.description !== undefined &&
        typeof input.description !== "string"
    ) {
        throw new Error("description must be a string");
    }

    if (
        input.metadata !== undefined &&
        (typeof input.metadata !== "object" ||
            input.metadata === null ||
            Array.isArray(input.metadata))
    ) {
        throw new Error("metadata must be an object");
    }

    return {
        name: input.name.trim(),
        description: input.description ?? "",
        metadata: structuredClone(input.metadata ?? {})
    };
}

export function validateUpdateIntelligence(
    input: UpdateIntelligenceInput
): UpdateIntelligenceInput {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new Error("update input must be an object");
    }

    if (input.name !== undefined &&
        (typeof input.name !== "string" || !input.name.trim())) {
        throw new Error("name must not be empty");
    }

    if (input.description !== undefined &&
        typeof input.description !== "string") {
        throw new Error("description must be a string");
    }

    if (
        input.status !== undefined &&
        input.status !== "active" &&
        input.status !== "inactive"
    ) {
        throw new Error("status must be active or inactive");
    }

    if (
        input.metadata !== undefined &&
        (typeof input.metadata !== "object" ||
            input.metadata === null ||
            Array.isArray(input.metadata))
    ) {
        throw new Error("metadata must be an object");
    }

    return structuredClone(input);
}

export function validateIntelligenceRecord(
    value: IntelligenceRecord
): IntelligenceRecord {
    if (!value.id || !value.name || !value.createdAt || !value.updatedAt) {
        throw new Error("record is missing required fields");
    }

    return structuredClone(value);
}
