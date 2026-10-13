import type { AuditEvent } from "./events.js";

export class AuditHistory {
    private readonly entries: AuditEvent[] = [];

    append(event: AuditEvent): void {
        this.entries.push(structuredClone(event));
    }

    list(filter: { actor?: string; type?: string; from?: string; to?: string } = {}): AuditEvent[] {
        return this.entries
            .filter((event) => !filter.actor || event.actor === filter.actor)
            .filter((event) => !filter.type || event.type === filter.type)
            .filter((event) => !filter.from || event.timestamp >= filter.from)
            .filter((event) => !filter.to || event.timestamp <= filter.to)
            .map((event) => structuredClone(event));
    }
}
