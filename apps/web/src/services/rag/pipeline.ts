import { retrieveDocuments } from "./retrieval";
import { rerankDocuments } from "./reranking";
import {
  compressContext,
  assembleContext,
} from "./context";

export interface RagPipelineOptions {
  retrievalTopK?: number;
  finalTopK?: number;
  maxContextCharacters?: number;
}

export interface RagPipelineResult {
  query: string;
  retrieved: Awaited<
    ReturnType<typeof retrieveDocuments>
  >;
  reranked: Awaited<
    ReturnType<typeof rerankDocuments>
  >;
  context: string;
  citations: Array<{
    id: string;
    documentId: string;
    title: string;
    score: number;
    citation: string;
  }>;
}

export async function runRagPipeline(
  query: string,
  options: RagPipelineOptions = {}
): Promise<RagPipelineResult> {
  if (!query.trim()) {
    throw new Error("Query is required");
  }

  const retrieved = await retrieveDocuments(query, {
    topK: options.retrievalTopK ?? 10,
  });

  const reranked = rerankDocuments(
    query,
    retrieved,
    {
      topK: options.finalTopK ?? 5,
    }
  );

  const compressed = compressContext(
    reranked,
    options.maxContextCharacters ?? 6000
  );

  const assembled = assembleContext(compressed);

  return {
    query,
    retrieved,
    reranked: compressed,
    context: assembled.context,
    citations: assembled.items.map((item) => ({
      id: item.id,
      documentId: item.documentId,
      title: item.title,
      score: item.score,
      citation: item.citation,
    })),
  };
}