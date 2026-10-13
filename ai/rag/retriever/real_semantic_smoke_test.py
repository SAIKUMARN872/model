import asyncio
import math

from ai.rag.models import RAGDocument
from ai.rag.retriever.vector_retriever import VectorRetriever
from ai.rag.retriever.sentence_transformer_store import (
    SentenceTransformerVectorStore,
)


async def main():
    print("Loading real Sentence Transformers model...")
    store = SentenceTransformerVectorStore(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    retriever = VectorRetriever(store)

    documents = [
        RAGDocument(
            document_id="vehicle",
            text=(
                "A passenger car is a road vehicle used for driving "
                "on highways and travelling between cities."
            ),
            metadata={"category": "transport"},
        ),
        RAGDocument(
            document_id="recipe",
            text=(
                "Chocolate cake is a dessert prepared with cocoa, "
                "flour, sugar, butter, and eggs."
            ),
            metadata={"category": "cooking"},
        ),
        RAGDocument(
            document_id="computer",
            text=(
                "A computer processes information using a processor, "
                "memory, storage, and software applications."
            ),
            metadata={"category": "technology"},
        ),
    ]

    retriever.add_documents(documents)
    print("PASS - REAL MODEL DOCUMENT EMBEDDING")

    results = await retriever.retrieve(
        "How can I drive an automobile on a highway?",
        top_k=3,
    )

    assert len(results) == 3
    assert results[0].document.document_id == "vehicle", [
        (item.document.document_id, round(item.score, 4))
        for item in results
    ]
    assert all(math.isfinite(item.score) for item in results)
    assert [item.rank for item in results] == [1, 2, 3]
    print("PASS - REAL SEMANTIC RELEVANCE AND RANKING")

    filtered = await retriever.retrieve(
        "How can I drive an automobile on a highway?",
        top_k=3,
        filters={"category": "cooking"},
    )
    assert len(filtered) == 1
    assert filtered[0].document.document_id == "recipe"
    print("PASS - REAL MODEL METADATA FILTERING")

    print("REAL SENTENCE TRANSFORMERS SMOKE TEST PASSED")


if __name__ == "__main__":
    asyncio.run(main())
