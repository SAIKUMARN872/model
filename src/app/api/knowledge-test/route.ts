import { NextResponse } from "next/server";

import { ingestDocument } from "../../../services/knowledge/ingestion";
import { retrieveDocuments } from "../../../services/rag/retrieval";
import { getVectorStore } from "../../../services/vector-store";
export async function GET() {
  try {
    // 1. Ingest sample knowledge
    const ingestion = await ingestDocument({
      title: "ModelNow Enterprise AI",
      content: `
        ModelNow is an enterprise AI platform designed for organizations.

        It provides AI chat, Knowledge Hub, browser automation,
        computer use, agents, workflows, fine-tuning, and model routing.

        Knowledge Hub allows organizations to upload company documents
        and retrieve relevant information from their internal knowledge.

        The Knowledge Hub pipeline uses ingestion, chunking, embeddings,
        vector storage, retrieval, reranking, context assembly,
        and response generation.
      `,
      source: "knowledge-test",
    });

    // 2. Check vector store
    const vectorStore = getVectorStore();

    // 3. Run retrieval
    const query = "What does Knowledge Hub do?";

    const results = await retrieveDocuments(query, {
      topK: 3,
    });

    return NextResponse.json({
      success: true,

      ingestion: {
        status: ingestion.status,
        documentTitle: ingestion.document.title,
        chunkCount: ingestion.chunkCount,
        embeddedCount: ingestion.embeddedCount,
        vectorStoredCount: ingestion.vectorStoredCount,
      },

      vectorStore: {
        totalRecords: vectorStore.length,
      },

      retrieval: {
        query,
        resultCount: results.length,
        results,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Knowledge pipeline test failed",
      },
      { status: 500 }
    );
  }
}