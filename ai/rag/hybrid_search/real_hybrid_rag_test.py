import asyncio

from ai.rag.hybrid_search import BM25Retriever, HybridRetriever
from ai.rag.models import RAGDocument, RAGRequest
from ai.rag.pipeline.pipeline import RAGPipeline
from ai.rag.retriever.sentence_transformer_store import (
    SentenceTransformerVectorStore,
)
from ai.rag.retriever.vector_retriever import VectorRetriever


async def main():
    documents = [
        RAGDocument(
            document_id="car",
            text="A car is a road vehicle used for driving on highways.",
            metadata={"category": "transport"},
        ),
        RAGDocument(
            document_id="cake",
            text="Chocolate cake is a dessert made with cocoa and flour.",
            metadata={"category": "cooking"},
        ),
        RAGDocument(
            document_id="modelnow",
            text="ModelNow optimizes AI model routing, cost, latency, and quality.",
            metadata={"category": "technology"},
        ),
    ]

    print("Loading embedding model...")
    store = SentenceTransformerVectorStore()
    semantic = VectorRetriever(store)
    semantic.add_documents(documents)

    keyword = BM25Retriever(documents)
    hybrid = HybridRetriever(
        keyword_retriever=keyword,
        semantic_retriever=semantic,
    )

    response = await RAGPipeline(retriever=hybrid).run(
        RAGRequest(
            query="automobile driving on a highway",
            top_k=3,
            rerank_top_n=None,
        )
    )

    assert response.sources
    assert response.sources[0].document.document_id == "car", [
        (item.document.document_id, round(item.score, 4))
        for item in response.sources
    ]
    assert response.metadata["reranking_used"] is False
    assert "road vehicle" in response.context
    print("PASS - REAL SEMANTIC AND KEYWORD FUSION")

    filtered = await RAGPipeline(retriever=hybrid).run(
        RAGRequest(
            query="automobile driving on a highway",
            top_k=3,
            rerank_top_n=None,
            filters={"category": "cooking"},
        )
    )

    assert filtered.sources
    assert all(
        item.document.metadata["category"] == "cooking"
        for item in filtered.sources
    )
    assert filtered.sources[0].document.document_id == "cake"
    print("PASS - HYBRID FILTERS ACROSS BOTH RETRIEVERS")

    print("REAL HYBRID RAG INTEGRATION PASSED")


if __name__ == "__main__":
    asyncio.run(main())
