export interface IngestionEvent {
    type: "ingestion.started" | "ingestion.completed" | "ingestion.failed";
    sourceId: string;
    timestamp: string;
    error?: string;
}

export class IngestionEventBus {
    private readonly handlers = new Set<(event: IngestionEvent) => void | Promise<void>>();

    on(handler: (event: IngestionEvent) => void | Promise<void>): () => void {
        this.handlers.add(handler);
        return () => this.handlers.delete(handler);
    }

    async emit(event: IngestionEvent): Promise<void> {
        for (const handler of [...this.handlers]) await handler(structuredClone(event));
    }
}
