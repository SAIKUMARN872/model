import asyncio

from ai.rag.hybrid_search import BM25Retriever, HybridRetriever
from ai.rag.interfaces import Retriever
from ai.rag.models import RAGDocument, RAGRequest
from ai.rag.pipeline.orchestrator import RAGOrchestrator
from ai.rag.pipeline.pipeline import RAGPipeline


def build_documents():
    return [
        RAGDocument(
            document_id="modelnow",
            text="ModelNow optimizes AI model cost latency and quality.",
            metadata={"category": "architecture"},
        ),
        RAGDocument(
            document_id="routing",
            text="Automatic model routing selects models based on query context and cost.",
            metadata={"category": "routing"},
        ),
        RAGDocument(
            document_id="cooking",
            text="Chocolate cake uses flour cocoa sugar and eggs.",
            metadata={"category": "cooking"},
        ),
    ]


def build_hybrid_retriever():
    return HybridRetriever(
        keyword_retriever=BM25Retriever(build_documents())
    )


async def main():
    # Test 1: HybridRetriever implements the existing Retriever interface.
    retriever = build_hybrid_retriever()
    assert isinstance(retriever, Retriever)
    print("PASS - RETRIEVER INTERFACE COMPATIBILITY")

    # Test 2: Run hybrid retrieval through the existing pipeline.
    pipeline = RAGPipeline(retriever=retriever)
    response = await pipeline.run(
        RAGRequest(
            query="ModelNow AI model cost",
            top_k=3,
            rerank_top_n=None,
        )
    )

    assert response.query == "ModelNow AI model cost"
    assert response.sources
    assert response.metadata["retrieved_count"] == len(response.sources)
    assert response.metadata["reranking_used"] is False
    assert "ModelNow" in response.context
    print("PASS - HYBRID RETRIEVAL THROUGH RAG PIPELINE")

    # Test 3: Verify metadata filters remain effective.
    filtered = await pipeline.run(
        RAGRequest(
            query="model routing cost",
            top_k=3,
            rerank_top_n=None,
            filters={"category": "routing"},
        )
    )

    assert filtered.sources
    assert all(
        item.document.metadata["category"] == "routing"
        for item in filtered.sources
    )
    print("PASS - HYBRID PIPELINE METADATA FILTERING")

    # Test 4: Verify the existing orchestrator can use hybrid retrieval.
    orchestrator = RAGOrchestrator(
        retriever=build_hybrid_retriever()
    )
    orchestrated = await orchestrator.query(
        "automatic model routing cost",
        top_k=3,
        rerank_top_n=None,
        filters={"category": "routing"},
    )

    assert orchestrated.sources
    assert all(
        item.document.metadata["category"] == "routing"
        for item in orchestrated.sources
    )
    assert "[Source:" in orchestrated.context
    print("PASS - HYBRID RETRIEVAL THROUGH ORCHESTRATOR")

    # Test 5: An unrelated query should return no matches in BM25-only mode.
    empty = await pipeline.run(
        RAGRequest(
            query="astronomy telescope galaxies",
            top_k=3,
            rerank_top_n=None,
        )
    )

    assert empty.sources == ()
    assert empty.context == ""
    assert empty.answer is None
    print("PASS - EMPTY RETRIEVAL HANDLING")

    print("ALL HYBRID PIPELINE INTEGRATION TESTS PASSED")


if __name__ == "__main__":
    asyncio.run(main())
