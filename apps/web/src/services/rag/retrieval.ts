import { createEmbedding } from "./embeddings";
import { searchVectorStore } from "../vector-store";

export interface RetrievedDocument {
  id: string;
  title: string;
  content: string;
  documentId: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface RetrievalOptions {
  topK?: number;
  minScore?: number;
}

/**
 * Retrieves the most relevant knowledge chunks
 * from the vector store for a user query.
 */
export async function retrieveDocuments(
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievedDocument[]> {
  if (!query.trim()) {
    throw new Error("Query is required");
  }

  const topK = options.topK ?? 5;
  const minScore = options.minScore ?? -Infinity;

  // Convert the user's query into an embedding
  const queryEmbedding = await createEmbedding(query);

  // Search the vector store using cosine similarity
  const results = searchVectorStore(
    queryEmbedding.vector,
    topK
  );

  // Convert vector results into retrieval results
  return results
    .filter((result) => result.score >= minScore)
    .map((result) => ({
      id: result.id,
      title:
        typeof result.metadata?.title === "string"
          ? result.metadata.title
          : "Knowledge Document",
      content: result.content,
      documentId: result.documentId,
      score: result.score,
      metadata: result.metadata,
    }));
}