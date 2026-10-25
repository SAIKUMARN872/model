import {
  KnowledgeDocument,
  KnowledgeChunk,
  chunkDocument,
} from "./chunking";

import { createEmbeddings } from "../rag/embeddings";

import { addEmbeddingsToVectorStore } from "../vector-store";

export interface IngestionResult {
  document: KnowledgeDocument;
  chunks: KnowledgeChunk[];
  chunkCount: number;
  embeddedCount: number;
  vectorStoredCount: number;
  status: "completed" | "failed";
  error?: string;
}

export interface IngestDocumentInput {
  title: string;
  content: string;
  source?: string;
  metadata?: Record<string, unknown>;
  chunkSize?: number;
  overlap?: number;
}

export async function ingestDocument(
  input: IngestDocumentInput
): Promise<IngestionResult> {
  try {
    if (!input.title.trim()) {
      throw new Error("Document title is required");
    }

    if (!input.content.trim()) {
      throw new Error("Document content is required");
    }

    // 1. Create the knowledge document
    const document: KnowledgeDocument = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      content: input.content.trim(),
      source: input.source,
      metadata: input.metadata,
    };

    // 2. Split document into chunks
    const chunks = chunkDocument(document, {
      chunkSize: input.chunkSize ?? 800,
      overlap: input.overlap ?? 120,
    });

    if (chunks.length === 0) {
      throw new Error("No chunks were created from the document");
    }

    // 3. Create embeddings for every chunk
    const embeddings = await createEmbeddings(
      chunks.map((chunk) => ({
        id: chunk.id,
        text: chunk.content,
        metadata: chunk.metadata,
      }))
    );

    // 4. Store embeddings + chunks in vector store
    const vectorRecords = addEmbeddingsToVectorStore(
      embeddings,
      document.id,
      chunks.map((chunk) => ({
        id: chunk.id,
        content: chunk.content,
        metadata: chunk.metadata,
      }))
    );

    return {
      document,
      chunks,
      chunkCount: chunks.length,
      embeddedCount: embeddings.length,
      vectorStoredCount: vectorRecords.length,
      status: "completed",
    };
  } catch (error) {
    return {
      document: {
        id: crypto.randomUUID(),
        title: input.title,
        content: input.content,
        source: input.source,
        metadata: input.metadata,
      },
      chunks: [],
      chunkCount: 0,
      embeddedCount: 0,
      vectorStoredCount: 0,
      status: "failed",
      error:
        error instanceof Error
          ? error.message
          : "Document ingestion failed",
    };
  }
}