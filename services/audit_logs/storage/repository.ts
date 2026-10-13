import type { AuditEvent } from "../events/event_processor.js";

export interface AuditRepository {
    save(event: AuditEvent): AuditEvent;
    get(id: string): AuditEvent | undefined;
    list(): AuditEvent[];
    remove(id: string): boolean;
    clear(): void;
}

export class InMemoryAuditRepository implements AuditRepository {
    private readonly events = new Map<string, AuditEvent>();

    save(event: AuditEvent): AuditEvent {
        const stored = cloneEvent(event);
        this.events.set(stored.id, stored);
        return cloneEvent(stored);
    }

    get(id: string): AuditEvent | undefined {
        const event = this.events.get(id);
        return event ? cloneEvent(event) : undefined;
    }

    list(): AuditEvent[] {
        return [...this.events.values()].map(cloneEvent);
    }

    remove(id: string): boolean {
        return this.events.delete(id);
    }

    clear(): void {
        this.events.clear();
    }
}

function cloneEvent(event: AuditEvent): AuditEvent {
    return {
        ...event,
        timestamp: new Date(event.timestamp),
        metadata: { ...event.metadata }
    };
}
