import { randomUUID } from "node:crypto";
import { customizationSettings } from "../config/settings.js";
import { customizationEvents } from "../events/customization-events.js";
import { PreferenceRepository } from "../repository/preference-repository.js";
import {
    validateCreatePreference,
    type CreatePreferenceInput,
    type Preference
} from "../schemas/preference-schema.js";

export class PreferenceService {
    constructor(
        private readonly repository = new PreferenceRepository()
    ) {}

    create(input: CreatePreferenceInput): Preference {
        validateCreatePreference(input);

        const existing = this.repository.getByOwnerAndKey(
            input.ownerId,
            input.key
        );

        if (existing) {
            throw new Error("Preference key already exists for this owner");
        }

        if (this.repository.listByOwner(input.ownerId).length >=
            customizationSettings.maxPreferences) {
            throw new Error("Preference limit reached");
        }

        const now = new Date();
        const record: Preference = {
            id: randomUUID(),
            ownerId: input.ownerId.trim(),
            key: input.key.trim(),
            value: input.value,
            createdAt: now,
            updatedAt: now
        };

        const saved = this.repository.save(record);
        customizationEvents.emit("preference.created", saved.ownerId, saved.id, saved);
        return saved;
    }

    get(id: string, ownerId: string): Preference {
        const record = this.repository.getById(id);

        if (!record || record.ownerId !== ownerId) {
            throw new Error("Preference not found");
        }

        return record;
    }

    getByKey(ownerId: string, key: string): Preference {
        const record = this.repository.getByOwnerAndKey(ownerId, key);

        if (!record) {
            throw new Error("Preference not found");
        }

        return record;
    }

    list(ownerId: string): Preference[] {
        return this.repository.listByOwner(ownerId);
    }

    update(
        id: string,
        ownerId: string,
        value: Preference["value"]
    ): Preference {
        const current = this.get(id, ownerId);
        const updated = this.repository.save({
            ...current,
            value,
            updatedAt: new Date()
        });

        customizationEvents.emit("preference.updated", ownerId, id, updated);
        return updated;
    }

    delete(id: string, ownerId: string): void {
        this.get(id, ownerId);
        this.repository.delete(id);
        customizationEvents.emit("preference.deleted", ownerId, id, { id });
    }
}
