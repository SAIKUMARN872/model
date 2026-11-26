import type { Embedding } from "../rag/embeddings";

export interface VectorRecord {
  id: string;
  documentId: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
}

export interface VectorSearchResult extends VectorRecord {
  score: number;
}

const vectorStore: VectorRecord[] = [];

export function addToVectorStore(
  record: VectorRecord
): VectorRecord {
  const existingIndex = vectorStore.findIndex(
    (item) => item.id === record.id
  );

  if (existingIndex >= 0) {
    vectorStore[existingIndex] = record;
  } else {
    vectorStore.push(record);
  }

  return record;
}

export function addEmbeddingsToVectorStore(
  embeddings: Embedding[],
  documentId: string,
  chunks: Array<{
    id: string;
    content: string;
    metadata?: Record<string, unknown>;
  }>
): VectorRecord[] {
  const records: VectorRecord[] = [];

  for (const embedding of embeddings) {
    const chunk = chunks.find(
      (item) => item.id === embedding.id
    );

    if (!chunk) {
      continue;
    }

    records.push(
      addToVectorStore({
        id: embedding.id,
        documentId,
        content: chunk.content,
        embedding: embedding.vector,
        metadata: chunk.metadata,
      })
    );
  }

  return records;
}

export function getVectorStore(): VectorRecord[] {
  return [...vectorStore];
}

export function clearVectorStore(): void {
  vectorStore.length = 0;
}

export function cosineSimilarity(
  vectorA: number[],
  vectorB: number[]
): number {
  if (vectorA.length !== vectorB.length) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return (
    dotProduct /
    (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
  );
}

export function searchVectorStore(
  queryEmbedding: number[],
  topK = 5
): VectorSearchResult[] {
  return vectorStore
    .map((record) => ({
      ...record,
      score: cosineSimilarity(
        queryEmbedding,
        record.embedding
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}