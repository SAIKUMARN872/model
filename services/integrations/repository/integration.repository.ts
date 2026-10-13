import { clone, nowIso, type Integration } from "../integration.types.js";

export class IntegrationRepository {
    private readonly records = new Map<string, Integration>();

    create(input: Integration): Integration {
        if (this.records.has(input.id)) throw new Error("Integration already exists");
        const record = clone(input);
        this.records.set(record.id, record);
        return clone(record);
    }

    get(id: string): Integration | undefined {
        const record = this.records.get(id);
        return record ? clone(record) : undefined;
    }

    list(): Integration[] {
        return [...this.records.values()].map(clone);
    }

    update(id: string, changes: Partial<Omit<Integration, "id" | "createdAt">>): Integration {
        const record = this.records.get(id);
        if (!record) throw new Error("Integration not found");

        Object.assign(record, clone(changes), { updatedAt: nowIso() });
        return clone(record);
    }

    delete(id: string): boolean {
        return this.records.delete(id);
    }
}
