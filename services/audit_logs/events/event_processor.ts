export interface AuditEvent {
    id: string;
    type: string;
    action: string;
    actorId?: string;
    resourceType?: string;
    resourceId?: string;
    timestamp: Date;
    metadata: Record<string, unknown>;
}

export interface EventProcessorOptions {
    onError?: (error: Error, event: AuditEvent) => void;
}

export class EventProcessor {
    private readonly handlers = new Map<
        string,
        Array<(event: AuditEvent) => void | Promise<void>>
    >();

    private readonly onError?: (
        error: Error,
        event: AuditEvent
    ) => void;

    constructor(options: EventProcessorOptions = {}) {
        this.onError = options.onError;
    }

    register(
        eventType: string,
        handler: (event: AuditEvent) => void | Promise<void>
    ): void {
        if (!eventType.trim()) {
            throw new Error("Event type is required");
        }

        const handlers = this.handlers.get(eventType) ?? [];
        handlers.push(handler);
        this.handlers.set(eventType, handlers);
    }

    unregister(eventType: string): void {
        this.handlers.delete(eventType);
    }

    async process(event: AuditEvent): Promise<void> {
        const handlers = this.handlers.get(event.type) ?? [];

        for (const handler of handlers) {
            try {
                await handler(event);
            } catch (error) {
                const normalized =
                    error instanceof Error
                        ? error
                        : new Error(String(error));

                this.onError?.(normalized, event);
            }
        }
    }

    handlerCount(eventType?: string): number {
        if (eventType !== undefined) {
            return this.handlers.get(eventType)?.length ?? 0;
        }

        let count = 0;

        for (const handlers of this.handlers.values()) {
            count += handlers.length;
        }

        return count;
    }
}
