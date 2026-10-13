import type { Customization } from "../schemas/customization-schema.js";

function copy(value: Customization): Customization {
    return {
        ...value,
        createdAt: new Date(value.createdAt),
        updatedAt: new Date(value.updatedAt)
    };
}

export class CustomizationRepository {
    private readonly records = new Map<string, Customization>();

    save(value: Customization): Customization {
        const saved = copy(value);
        this.records.set(saved.id, saved);
        return copy(saved);
    }

    getById(id: string): Customization | undefined {
        const value = this.records.get(id);
        return value ? copy(value) : undefined;
    }

    listByOwner(ownerId: string): Customization[] {
        return [...this.records.values()]
            .filter(value => value.ownerId === ownerId)
            .map(copy);
    }

    delete(id: string): boolean {
        return this.records.delete(id);
    }
}
