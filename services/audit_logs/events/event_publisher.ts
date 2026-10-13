import { randomUUID } from "node:crypto";
import type { AuditEvent } from "./event_processor.js";

export type EventSubscriber = (
    event: AuditEvent
) => void | Promise<void>;

export interface PublishResult {
    event: AuditEvent;
    delivered: number;
    failed: number;
}

export class EventPublisher {
    private readonly subscribers = new Map<
        string,
        Set<EventSubscriber>
    >();

    subscribe(eventType: string, subscriber: EventSubscriber): () => void {
        if (!eventType.trim()) {
            throw new Error("Event type is required");
        }

        const subscribers =
            this.subscribers.get(eventType) ?? new Set<EventSubscriber>();

        subscribers.add(subscriber);
        this.subscribers.set(eventType, subscribers);

        return () => {
            subscribers.delete(subscriber);

            if (subscribers.size === 0) {
                this.subscribers.delete(eventType);
            }
        };
    }

    async publish(
        input: Omit<AuditEvent, "id" | "timestamp"> &
            Partial<Pick<AuditEvent, "id" | "timestamp">>
    ): Promise<PublishResult> {
        const event: AuditEvent = {
            id: input.id ?? randomUUID(),
            type: input.type,
            action: input.action,
            actorId: input.actorId,
            resourceType: input.resourceType,
            resourceId: input.resourceId,
            timestamp: input.timestamp ?? new Date(),
            metadata: { ...input.metadata }
        };

        const subscribers = this.subscribers.get(event.type);

        if (!subscribers || subscribers.size === 0) {
            return {
                event,
                delivered: 0,
                failed: 0
            };
        }

        let delivered = 0;
        let failed = 0;

        for (const subscriber of subscribers) {
            try {
                await subscriber(event);
                delivered++;
            } catch {
                failed++;
            }
        }

        return {
            event,
            delivered,
            failed
        };
    }

    subscriberCount(eventType?: string): number {
        if (eventType !== undefined) {
            return this.subscribers.get(eventType)?.size ?? 0;
        }

        let count = 0;

        for (const subscribers of this.subscribers.values()) {
            count += subscribers.size;
        }

        return count;
    }
}
