import type { Preference } from "../schemas/preference-schema.js";

function copy(value: Preference): Preference {
    return {
        ...value,
        createdAt: new Date(value.createdAt),
        updatedAt: new Date(value.updatedAt)
    };
}

export class PreferenceRepository {
    private readonly records = new Map<string, Preference>();

    save(value: Preference): Preference {
        const saved = copy(value);
        this.records.set(saved.id, saved);
        return copy(saved);
    }

    getById(id: string): Preference | undefined {
        const value = this.records.get(id);
        return value ? copy(value) : undefined;
    }

    getByOwnerAndKey(ownerId: string, key: string): Preference | undefined {
        for (const value of this.records.values()) {
            if (value.ownerId === ownerId && value.key === key) {
                return copy(value);
            }
        }

        return undefined;
    }

    listByOwner(ownerId: string): Preference[] {
        return [...this.records.values()]
            .filter(value => value.ownerId === ownerId)
            .map(copy);
    }

    delete(id: string): boolean {
        return this.records.delete(id);
    }
}
