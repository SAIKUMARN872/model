import type { Instruction } from "../schemas/instruction-schema.js";

function copy(value: Instruction): Instruction {
    return {
        ...value,
        createdAt: new Date(value.createdAt),
        updatedAt: new Date(value.updatedAt)
    };
}

export class InstructionRepository {
    private readonly records = new Map<string, Instruction>();

    save(value: Instruction): Instruction {
        const saved = copy(value);
        this.records.set(saved.id, saved);
        return copy(saved);
    }

    getById(id: string): Instruction | undefined {
        const value = this.records.get(id);
        return value ? copy(value) : undefined;
    }

    listByOwner(ownerId: string): Instruction[] {
        return [...this.records.values()]
            .filter(value => value.ownerId === ownerId)
            .map(copy);
    }

    delete(id: string): boolean {
        return this.records.delete(id);
    }
}
