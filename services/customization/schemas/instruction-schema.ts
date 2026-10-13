export interface Instruction {
    id: string;
    ownerId: string;
    content: string;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateInstructionInput {
    ownerId: string;
    content: string;
    enabled?: boolean;
}

export function validateCreateInstruction(input: CreateInstructionInput): void {
    if (!input || typeof input !== "object") {
        throw new Error("Instruction input is required");
    }

    if (typeof input.ownerId !== "string" || !input.ownerId.trim()) {
        throw new Error("ownerId is required");
    }

    if (typeof input.content !== "string" || !input.content.trim()) {
        throw new Error("content is required");
    }

    if (input.enabled !== undefined && typeof input.enabled !== "boolean") {
        throw new Error("enabled must be a boolean");
    }
}
