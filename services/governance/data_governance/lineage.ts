export interface LineageRecord {
    resourceId: string;
    parents: string[];
    operation: string;
    recordedAt: string;
    actor: string;
}

export class DataLineage {
    private readonly records = new Map<string, LineageRecord>();

    record(input: Omit<LineageRecord, "recordedAt">): LineageRecord {
        if (!input.resourceId.trim()) throw new Error("resourceId is required");
        if (input.parents.includes(input.resourceId)) throw new Error("A resource cannot be its own parent");
        const record: LineageRecord = { ...input, parents: [...new Set(input.parents)], recordedAt: new Date().toISOString() };
        this.records.set(record.resourceId, structuredClone(record));
        return record;
    }

    get(resourceId: string): LineageRecord | undefined {
        const record = this.records.get(resourceId);
        return record ? structuredClone(record) : undefined;
    }

    traceAncestors(resourceId: string): string[] {
        const found = new Set<string>();
        const visiting = new Set<string>();
        const visit = (id: string): void => {
            if (visiting.has(id)) throw new Error("Cycle detected in data lineage");
            const record = this.records.get(id);
            if (!record) return;
            visiting.add(id);
            for (const parent of record.parents) {
                if (!found.has(parent)) {
                    found.add(parent);
                    visit(parent);
                }
            }
            visiting.delete(id);
        };
        visit(resourceId);
        return [...found];
    }
}
