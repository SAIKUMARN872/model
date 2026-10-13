import asyncio

from ai.rag.models import RAGDocument
from ai.rag.retriever.vector_retriever import VectorRetriever
from ai.rag.retriever.sentence_transformer_store import (
    SentenceTransformerVectorStore,
)


class FakeEmbeddingModel:
    """Deterministic vectors for testing the vector-store contract."""

    def encode(
        self,
        sentences,
        *,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
    ):
        vectors = {
            "fruit apple": [1.0, 0.0, 0.0],
            "apple fruit": [1.0, 0.0, 0.0],
            "vehicle car": [0.0, 1.0, 0.0],
            "query fruit": [1.0, 0.0, 0.0],
            "query vehicle": [0.0, 1.0, 0.0],
        }
        return [vectors.get(text, [0.0, 0.0, 1.0]) for text in sentences]


async def main():
    documents = [
        RAGDocument(
            document_id="fruit",
            text="fruit apple",
            metadata={"category": "food"},
        ),
        RAGDocument(
            document_id="vehicle",
            text="vehicle car",
            metadata={"category": "transport"},
        ),
    ]

    store = SentenceTransformerVectorStore(model=FakeEmbeddingModel())
    retriever = VectorRetriever(store)
    retriever.add_documents(documents)

    results = await retriever.retrieve("query fruit", top_k=2)
    assert results[0].document.document_id == "fruit"
    assert results[0].score > results[1].score
    assert results[0].rank == 1
    print("PASS - SEMANTIC SIMILARITY RANKING")

    filtered = await retriever.retrieve(
        "query fruit",
        top_k=5,
        filters={"category": "transport"},
    )
    assert len(filtered) == 1
    assert filtered[0].document.document_id == "vehicle"
    print("PASS - SEMANTIC METADATA FILTERING")

    empty = await retriever.retrieve("query fruit", top_k=5, filters={"category": "missing"})
    assert empty == []
    print("PASS - SEMANTIC EMPTY FILTER RESULTS")

    try:
        await retriever.retrieve("   ")
    except ValueError:
        pass
    else:
        raise AssertionError("An empty query should be rejected.")
    print("PASS - SEMANTIC QUERY VALIDATION")

    try:
        retriever.add_documents([documents[0]])
    except ValueError:
        pass
    else:
        raise AssertionError("Duplicate document IDs should be rejected.")
    print("PASS - SEMANTIC DUPLICATE ID VALIDATION")

    print("ALL SEMANTIC VECTOR STORE TESTS PASSED")


if __name__ == "__main__":
    asyncio.run(main())
