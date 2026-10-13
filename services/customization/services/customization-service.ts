import { randomUUID } from "node:crypto";
import { customizationSettings } from "../config/settings.js";
import { customizationEvents } from "../events/customization-events.js";
import { CustomizationRepository } from "../repository/customization-repository.js";
import {
    validateCreateCustomization,
    type Customization,
    type CreateCustomizationInput
} from "../schemas/customization-schema.js";

export class CustomizationService {
    constructor(
        private readonly repository = new CustomizationRepository()
    ) {}

    create(input: CreateCustomizationInput): Customization {
        validateCreateCustomization(input);

        const now = new Date();
        const record: Customization = {
            id: randomUUID(),
            ownerId: input.ownerId.trim(),
            name: input.name.trim(),
            enabled: input.enabled ?? true,
            createdAt: now,
            updatedAt: now
        };

        const saved = this.repository.save(record);
        customizationEvents.emit("customization.created", saved.ownerId, saved.id, saved);
        return saved;
    }

    get(id: string, ownerId: string): Customization {
        const record = this.repository.getById(id);

        if (!record || record.ownerId !== ownerId) {
            throw new Error("Customization not found");
        }

        return record;
    }

    list(ownerId: string): Customization[] {
        return this.repository.listByOwner(ownerId);
    }

    update(
        id: string,
        ownerId: string,
        patch: Partial<Pick<Customization, "name" | "enabled">>
    ): Customization {
        const current = this.get(id, ownerId);
        const name = patch.name === undefined ? current.name : patch.name.trim();

        if (!name) {
            throw new Error("name cannot be empty");
        }

        if (patch.enabled !== undefined && typeof patch.enabled !== "boolean") {
            throw new Error("enabled must be a boolean");
        }

        const updated = this.repository.save({
            ...current,
            name,
            enabled: patch.enabled ?? current.enabled,
            updatedAt: new Date()
        });

        customizationEvents.emit("customization.updated", ownerId, id, updated);
        return updated;
    }

    delete(id: string, ownerId: string): void {
        this.get(id, ownerId);

        if (!this.repository.delete(id)) {
            throw new Error("Customization not found");
        }

        customizationEvents.emit("customization.deleted", ownerId, id, { id });
    }

    getRepository(): CustomizationRepository {
        return this.repository;
    }

    getMaxInstructions(): number {
        return customizationSettings.maxInstructions;
    }
}
