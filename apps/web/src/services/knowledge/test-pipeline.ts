import { ingestDocument } from "./ingestion";
import { retrieveDocuments } from "../rag/retrieval";
import { getVectorStore } from "../vector-store";

async function runKnowledgePipelineTest() {
  console.log("\n=== Knowledge Hub Pipeline Test ===\n");

  // 1. Ingest a sample document
  const ingestion = await ingestDocument({
    title: "ModelNow Enterprise AI",
    content: `
      ModelNow is an enterprise AI platform designed for organizations.
      It provides AI chat, knowledge management, browser automation,
      computer use, agents, workflows, fine-tuning, and model routing.

      Knowledge Hub allows organizations to upload company documents
      and retrieve relevant information from their internal knowledge.

      The Knowledge Hub pipeline uses ingestion, chunking, embeddings,
      vector storage, retrieval, reranking, context assembly,
      and response generation.
    `,
    source: "pipeline-test",
  });

  console.log("1. Ingestion:");
  console.log({
    status: ingestion.status,
    document: ingestion.document.title,
    chunks: ingestion.chunkCount,
    embedded: ingestion.embeddedCount,
    vectorStored: ingestion.vectorStoredCount,
  });

  // 2. Check vector store
  const storedVectors = getVectorStore();

  console.log("\n2. Vector Store:");
  console.log(`Stored vectors: ${storedVectors.length}`);

  // 3. Search the knowledge
  const query = "What does Knowledge Hub do?";

  const results = await retrieveDocuments(query, {
    topK: 3,
  });

  console.log("\n3. Retrieval:");
  console.log(`Query: ${query}`);
  console.log(`Results: ${results.length}`);

  results.forEach((result, index) => {
    console.log(`\nResult ${index + 1}`);
    console.log("Title:", result.title);
    console.log("Score:", result.score);
    console.log("Content:", result.content);
  });

  console.log("\n=== Test Complete ===\n");
}

runKnowledgePipelineTest().catch((error) => {
  console.error("\nPipeline test failed:");
  console.error(error);
  process.exit(1);
});