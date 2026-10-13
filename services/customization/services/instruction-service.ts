import { randomUUID } from "node:crypto";
import { customizationSettings } from "../config/settings.js";
import { customizationEvents } from "../events/customization-events.js";
import { InstructionRepository } from "../repository/instruction-repository.js";
import {
    validateCreateInstruction,
    type CreateInstructionInput,
    type Instruction
} from "../schemas/instruction-schema.js";

export class InstructionService {
    constructor(
        private readonly repository = new InstructionRepository()
    ) {}

    create(input: CreateInstructionInput): Instruction {
        validateCreateInstruction(input);

        if (!customizationSettings.allowCustomInstructions) {
            throw new Error("Custom instructions are disabled");
        }

        const existing = this.repository.listByOwner(input.ownerId);
        if (existing.length >= customizationSettings.maxInstructions) {
            throw new Error("Instruction limit reached");
        }

        const now = new Date();
        const record: Instruction = {
            id: randomUUID(),
            ownerId: input.ownerId.trim(),
            content: input.content.trim(),
            enabled: input.enabled ?? true,
            createdAt: now,
            updatedAt: now
        };

        const saved = this.repository.save(record);
        customizationEvents.emit("instruction.created", saved.ownerId, saved.id, saved);
        return saved;
    }

    get(id: string, ownerId: string): Instruction {
        const record = this.repository.getById(id);

        if (!record || record.ownerId !== ownerId) {
            throw new Error("Instruction not found");
        }

        return record;
    }

    list(ownerId: string): Instruction[] {
        return this.repository.listByOwner(ownerId);
    }

    update(
        id: string,
        ownerId: string,
        patch: Partial<Pick<Instruction, "content" | "enabled">>
    ): Instruction {
        const current = this.get(id, ownerId);
        const content = patch.content === undefined
            ? current.content
            : patch.content.trim();

        if (!content) {
            throw new Error("content cannot be empty");
        }

        if (patch.enabled !== undefined && typeof patch.enabled !== "boolean") {
            throw new Error("enabled must be a boolean");
        }

        const updated = this.repository.save({
            ...current,
            content,
            enabled: patch.enabled ?? current.enabled,
            updatedAt: new Date()
        });

        customizationEvents.emit("instruction.updated", ownerId, id, updated);
        return updated;
    }

    delete(id: string, ownerId: string): void {
        this.get(id, ownerId);
        this.repository.delete(id);
        customizationEvents.emit("instruction.deleted", ownerId, id, { id });
    }
}
