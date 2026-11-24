export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  metadata?: Record<string, unknown>;
}

export interface ChunkingOptions {
  chunkSize?: number;
  overlap?: number;
}

export function chunkDocument(
  document: KnowledgeDocument,
  options: ChunkingOptions = {}
): KnowledgeChunk[] {
  const chunkSize = options.chunkSize ?? 800;
  const overlap = options.overlap ?? 120;

  if (!document.content.trim()) {
    return [];
  }

  if (chunkSize <= 0) {
    throw new Error("chunkSize must be greater than 0");
  }

  if (overlap < 0 || overlap >= chunkSize) {
    throw new Error(
      "overlap must be greater than or equal to 0 and smaller than chunkSize"
    );
  }

  const content = document.content.trim();
  const chunks: KnowledgeChunk[] = [];

  let start = 0;
  let chunkIndex = 0;

  while (start < content.length) {
    const end = Math.min(start + chunkSize, content.length);

    const chunkContent = content.slice(start, end).trim();

    if (chunkContent) {
      chunks.push({
        id: `${document.id}-chunk-${chunkIndex}`,
        documentId: document.id,
        content: chunkContent,
        chunkIndex,
        metadata: {
          title: document.title,
          source: document.source,
          ...document.metadata,
        },
      });
    }

    if (end >= content.length) {
      break;
    }

    start = end - overlap;
    chunkIndex++;
  }

  return chunks;
}