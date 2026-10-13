import { randomUUID } from "node:crypto";
import type {
    BillingEvent
} from "./events.js";

export class BillingEventPublisher {
    private readonly events:
        BillingEvent[] = [];

    private readonly listeners =
        new Set<
            (event: BillingEvent) => void
        >();

    publish(
        type: string,
        data: Record<string, unknown>,
        context: Partial<
            Pick<
                BillingEvent,
                | "customerId"
                | "subscriptionId"
                | "invoiceId"
                | "paymentId"
            >
        > = {}
    ): BillingEvent {
        const event: BillingEvent = {
            id: randomUUID(),
            type,
            ...context,
            data,
            createdAt: new Date()
        };

        this.events.push(event);

        for (
            const listener of
                this.listeners
        ) {
            listener(event);
        }

        return event;
    }

    subscribe(
        listener: (
            event: BillingEvent
        ) => void
    ): () => void {
        this.listeners.add(listener);

        return () =>
            this.listeners.delete(
                listener
            );
    }

    list(): BillingEvent[] {
        return [...this.events];
    }
}
