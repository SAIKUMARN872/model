export type CustomizationEventType =
    | "customization.created"
    | "customization.updated"
    | "customization.deleted"
    | "instruction.created"
    | "instruction.updated"
    | "instruction.deleted"
    | "preference.created"
    | "preference.updated"
    | "preference.deleted";

export interface CustomizationEvent<T = unknown> {
    type: CustomizationEventType;
    ownerId: string;
    resourceId: string;
    payload: T;
    occurredAt: Date;
}

type Listener = (event: CustomizationEvent) => void;

export class CustomizationEventEmitter {
    private readonly listeners = new Set<Listener>();

    on(listener: Listener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    emit<T>(
        type: CustomizationEventType,
        ownerId: string,
        resourceId: string,
        payload: T
    ): void {
        const event: CustomizationEvent<T> = {
            type,
            ownerId,
            resourceId,
            payload,
            occurredAt: new Date()
        };

        for (const listener of [...this.listeners]) {
            listener(event);
        }
    }

    clear(): void {
        this.listeners.clear();
    }
}

export const customizationEvents = new CustomizationEventEmitter();
