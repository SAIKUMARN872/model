export interface IndexingEvent {
    type: "indexing.started" | "indexing.completed" | "indexing.failed";
    documentId: string;
    timestamp: string;
    error?: string;
}

export class IndexingEventBus {
    private readonly handlers = new Set<(event: IndexingEvent) => void | Promise<void>>();

    on(handler: (event: IndexingEvent) => void | Promise<void>): () => void {
        this.handlers.add(handler);
        return () => this.handlers.delete(handler);
    }

    async emit(event: IndexingEvent): Promise<void> {
        for (const handler of [...this.handlers]) await handler(structuredClone(event));
    }
}
