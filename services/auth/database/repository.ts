export interface Repository<T extends { id: string }> {
    create(value: T): T
    findById(id: string): T | undefined
    update(id: string, patch: Partial<T>): T
    delete(id: string): boolean
    list(): T[]
}

export class MemoryRepository<T extends { id: string }> implements Repository<T> {
    private readonly values = new Map<string, T>()

    create(value: T): T {
        if (this.values.has(value.id)) {
            throw new Error("Record already exists")
        }

        this.values.set(value.id, value)
        return value
    }

    findById(id: string): T | undefined {
        return this.values.get(id)
    }

    update(id: string, patch: Partial<T>): T {
        const current = this.values.get(id)

        if (!current) {
            throw new Error("Record not found")
        }

        const updated = { ...current, ...patch, id: current.id }
        this.values.set(id, updated)
        return updated
    }

    delete(id: string): boolean {
        return this.values.delete(id)
    }

    list(): T[] {
        return [...this.values.values()]
    }
}
