import asyncio

from ai.rag.models import RAGDocument, RAGRequest
from ai.rag.pipeline.executor import RAGPipelineExecutor
from ai.rag.pipeline.pipeline import RAGPipeline
from ai.rag.ranking import RAGReranker
from ai.rag.retriever.retriever import InMemoryRetriever


async def main():
    documents = [
        RAGDocument(
            document_id="modelnow",
            text="ModelNow optimizes AI model cost, latency, and quality.",
            metadata={"category": "architecture"},
        ),
        RAGDocument(
            document_id="routing",
            text="Automatic model routing selects models based on query context and cost.",
            metadata={"category": "routing"},
        ),
        RAGDocument(
            document_id="recipe",
            text="Chocolate cake uses flour, cocoa, sugar, and eggs.",
            metadata={"category": "cooking"},
        ),
    ]

    retriever = InMemoryRetriever(documents)
    pipeline = RAGPipeline(
        retriever=retriever,
        reranker=RAGReranker(provider_id="bge"),
    )
    executor = RAGPipelineExecutor(pipeline)

    response = await executor.execute(
        RAGRequest(
            query="ModelNow AI model cost optimization",
            top_k=3,
            rerank_top_n=2,
        )
    )

    assert response.query == "ModelNow AI model cost optimization"
    print("PASS - RAG REQUEST AND RESPONSE")

    assert response.metadata["retrieved_count"] == 2
    assert response.metadata["result_count"] == 2
    print("PASS - RETRIEVAL AND RERANK TOP-N")

    assert response.metadata["reranking_used"] is True
    assert len(response.sources) == 2
    assert response.sources[0].rank == 1
    assert response.sources[1].rank == 2
    print("PASS - RERANKING INTEGRATION")

    assert response.sources[0].document.document_id == "modelnow"
    print("PASS - RELEVANT DOCUMENT RANKING")

    assert "[Source:" in response.context
    assert "ModelNow" in response.context
    print("PASS - CONTEXT BUILDING")

    filtered = await executor.execute(
        RAGRequest(
            query="AI model cost",
            top_k=3,
            rerank_top_n=2,
            filters={"category": "routing"},
        )
    )
    assert all(
        item.document.metadata["category"] == "routing"
        for item in filtered.sources
    )
    print("PASS - METADATA FILTERING")

    empty_retriever = InMemoryRetriever()
    empty_pipeline = RAGPipeline(retriever=empty_retriever)
    empty_response = await empty_pipeline.run(
        RAGRequest(query="unknown topic")
    )
    assert empty_response.sources == ()
    assert empty_response.context == ""
    print("PASS - EMPTY RETRIEVAL")

    print("PASS - RAG PIPELINE INTEGRATION TEST")


if __name__ == "__main__":
    asyncio.run(main())

