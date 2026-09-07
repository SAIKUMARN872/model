export interface DocumentChunk {
  id: string;
  content: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface SearchResult {
  id: string;
  content: string;
  score: number;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface RagQuery {
  query: string;
  topK?: number;
}

export class RagService {
  private documents: DocumentChunk[] = [];

  public addDocument(document: DocumentChunk): void {
    if (!document.id) {
      throw new Error("Document ID is required.");
    }

    if (!document.content) {
      throw new Error("Document content is required.");
    }

    this.documents.push(document);
  }

  public addDocuments(documents: DocumentChunk[]): void {
    for (const document of documents) {
      this.addDocument(document);
    }
  }

  public search(query: RagQuery): SearchResult[] {
    if (!query.query.trim()) {
      return [];
    }

    const topK = query.topK ?? 5;

    const searchTerms = query.query
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const results: SearchResult[] = this.documents
      .map((document) => {
        const content = document.content.toLowerCase();

        let score = 0;

        for (const term of searchTerms) {
          if (content.includes(term)) {
            score += 1;
          }
        }

        return {
          id: document.id,
          content: document.content,
          score,
          source: document.source,
          metadata: document.metadata,
        };
      })
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return results;
  }

  public getContext(
    query: string,
    topK: number = 5
  ): string {
    const results = this.search({
      query,
      topK,
    });

    return results
      .map((result) => result.content)
      .join("\n\n");
  }

  public getDocument(
    documentId: string
  ): DocumentChunk | undefined {
    return this.documents.find(
      (document) => document.id === documentId
    );
  }

  public removeDocument(
    documentId: string
  ): boolean {
    const initialLength = this.documents.length;

    this.documents = this.documents.filter(
      (document) => document.id !== documentId
    );

    return this.documents.length < initialLength;
  }

  public listDocuments(): DocumentChunk[] {
    return [...this.documents];
  }

  public count(): number {
    return this.documents.length;
  }

  public clear(): void {
    this.documents = [];
  }
}

const ragService = new RagService();

export default ragService;