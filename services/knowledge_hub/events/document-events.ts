import type { KnowledgeDocument } from "../knowledge.types.js";

export interface DocumentEvent {
    type: "document.created" | "document.updated" | "document.deleted";
    documentId: string;
    timestamp: string;
}

export type DocumentEventHandler = (event: DocumentEvent) => void | Promise<void>;

export class DocumentEventBus {
    private readonly handlers = new Set<DocumentEventHandler>();

    on(handler: DocumentEventHandler): () => void {
        this.handlers.add(handler);
        return () => this.handlers.delete(handler);
    }

    async emit(event: DocumentEvent): Promise<void> {
        for (const handler of [...this.handlers]) await handler(structuredClone(event));
    }

    static created(document: KnowledgeDocument): DocumentEvent {
        return {
            type: "document.created",
            documentId: document.id,
            timestamp: document.createdAt
        };
    }
}
