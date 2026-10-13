import { clone, nowIso, type IntegrationConnection } from "../integration.types.js";

export class ConnectionRepository {
    private readonly records = new Map<string, IntegrationConnection>();

    create(input: IntegrationConnection): IntegrationConnection {
        if (this.records.has(input.id)) throw new Error("Connection already exists");
        const record = clone(input);
        this.records.set(record.id, record);
        return clone(record);
    }

    get(id: string): IntegrationConnection | undefined {
        const record = this.records.get(id);
        return record ? clone(record) : undefined;
    }

    listByIntegration(integrationId: string): IntegrationConnection[] {
        return [...this.records.values()]
            .filter((record) => record.integrationId === integrationId)
            .map(clone);
    }

    list(): IntegrationConnection[] {
        return [...this.records.values()].map(clone);
    }

    update(
        id: string,
        changes: Partial<Omit<IntegrationConnection, "id" | "createdAt">>
    ): IntegrationConnection {
        const record = this.records.get(id);
        if (!record) throw new Error("Connection not found");

        Object.assign(record, clone(changes), { updatedAt: nowIso() });
        return clone(record);
    }

    delete(id: string): boolean {
        return this.records.delete(id);
    }
}
