export interface SearchEvent {
    query: string;
    resultCount: number;
    timestamp: string;
}

export class SearchEventBus {
    private readonly handlers = new Set<(event: SearchEvent) => void | Promise<void>>();

    on(handler: (event: SearchEvent) => void | Promise<void>): () => void {
        this.handlers.add(handler);
        return () => this.handlers.delete(handler);
    }

    async emit(event: SearchEvent): Promise<void> {
        for (const handler of [...this.handlers]) await handler(structuredClone(event));
    }
}
