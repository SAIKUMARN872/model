export * from "./integration.events.js";

import type { IntegrationEvent } from "./integration.events.js";

export type IntegrationEventHandler = (event: IntegrationEvent) => void | Promise<void>;

export class IntegrationEventBus {
    private readonly handlers = new Map<string, Set<IntegrationEventHandler>>();

    on(type: IntegrationEvent["type"], handler: IntegrationEventHandler): () => void {
        const handlers = this.handlers.get(type) ?? new Set<IntegrationEventHandler>();
        handlers.add(handler);
        this.handlers.set(type, handlers);

        return () => {
            handlers.delete(handler);
            if (handlers.size === 0) this.handlers.delete(type);
        };
    }

    async emit(event: IntegrationEvent): Promise<void> {
        const handlers = [...(this.handlers.get(event.type) ?? [])];

        for (const handler of handlers) {
            await handler(structuredClone(event));
        }
    }
}
