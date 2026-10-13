import type { DocumentChunk } from "../knowledge.types.js";
import { clone } from "../knowledge.types.js";

export class ChunkRepository {
    private readonly records = new Map<string, DocumentChunk>();

    async create(chunk: DocumentChunk): Promise<DocumentChunk> {
        if (this.records.has(chunk.id)) throw new Error("Chunk already exists");
        this.records.set(chunk.id, clone(chunk));
        return clone(chunk);
    }

    async getByDocument(documentId: string): Promise<DocumentChunk[]> {
        return [...this.records.values()]
            .filter(chunk => chunk.documentId === documentId)
            .sort((a, b) => a.index - b.index)
            .map(clone);
    }

    async deleteByDocument(documentId: string): Promise<number> {
        let count = 0;
        for (const [id, chunk] of this.records) {
            if (chunk.documentId === documentId) {
                this.records.delete(id);
                count++;
            }
        }
        return count;
    }
}
