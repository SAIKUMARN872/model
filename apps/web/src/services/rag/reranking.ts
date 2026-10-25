import type { RetrievedDocument } from "./retrieval";

export interface RerankingOptions {
  topK?: number;
  minScore?: number;
}

function lexicalOverlap(query: string, content: string): number {
  const queryWords = new Set(
    query
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2)
  );

  if (queryWords.size === 0) {
    return 0;
  }

  const contentWords = new Set(
    content
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2)
  );

  let matches = 0;

  for (const word of queryWords) {
    if (contentWords.has(word)) {
      matches++;
    }
  }

  return matches / queryWords.size;
}

export function rerankDocuments(
  query: string,
  documents: RetrievedDocument[],
  options: RerankingOptions = {}
): RetrievedDocument[] {
  const topK = options.topK ?? documents.length;
  const minScore = options.minScore ?? 0;

  return documents
    .map((document) => {
      const semanticScore = Math.max(0, document.score);
      const lexicalScore = lexicalOverlap(
        query,
        document.content
      );

      const rerankScore =
        semanticScore * 0.7 +
        lexicalScore * 0.3;

      return {
        ...document,
        score: rerankScore,
        metadata: {
          ...document.metadata,
          semanticScore,
          lexicalScore,
          rerankScore,
        },
      };
    })
    .filter((document) => document.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}