import type { IntelligenceRecord } from "../intelligence.types.js";

export type IntelligenceEvent =
    | {
        type: "intelligence.created";
        record: IntelligenceRecord;
        timestamp: string;
    }
    | {
        type: "intelligence.updated";
        record: IntelligenceRecord;
        timestamp: string;
    }
    | {
        type: "intelligence.deleted";
        id: string;
        timestamp: string;
    };

export type IntelligenceEventHandler =
    (event: IntelligenceEvent) => void | Promise<void>;

export class IntelligenceEventBus {
    private readonly handlers =
        new Map<IntelligenceEvent["type"], Set<IntelligenceEventHandler>>();

    on(
        type: IntelligenceEvent["type"],
        handler: IntelligenceEventHandler
    ): () => void {
        const handlers = this.handlers.get(type) ??
            new Set<IntelligenceEventHandler>();

        handlers.add(handler);
        this.handlers.set(type, handlers);

        return () => {
            handlers.delete(handler);
            if (handlers.size === 0) this.handlers.delete(type);
        };
    }

    async emit(event: IntelligenceEvent): Promise<void> {
        const handlers = [...(this.handlers.get(event.type) ?? [])];

        for (const handler of handlers) {
            await handler(structuredClone(event));
        }
    }
}
