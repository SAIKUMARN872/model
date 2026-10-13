from __future__ import annotations

import asyncio

from ai.rag.models import RAGDocument, RetrievedDocument
from ai.rag.retriever import (
    InMemoryRetriever,
    KeywordRetriever,
    VectorRetriever,
)


class ContractTestStore:
    """Small contract fixture for testing the adapter, not a DB backend."""

    def __init__(self) -> None:
        self.documents: dict[str, RAGDocument] = {}

    def add_documents(self, documents) -> None:
        incoming = list(documents)
        ids = [item.document_id for item in incoming]

        if len(ids) != len(set(ids)):
            raise ValueError("Duplicate IDs in batch.")

        if any(item_id in self.documents for item_id in ids):
            raise ValueError("Document ID already exists.")

        self.documents.update({item.document_id: item for item in incoming})

    async def search(self, query, top_k=5, filters=None):
        query_tokens = set(query.casefold().split())
        results = []

        for document in self.documents.values():
            metadata = document.metadata
            if any(metadata.get(key) != value for key, value in (filters or {}).items()):
                continue

            tokens = set(document.text.casefold().split())
            overlap = query_tokens & tokens
            if overlap:
                results.append(
                    RetrievedDocument(
                        document=document,
                        score=len(overlap) / len(query_tokens),
                    )
                )

        results.sort(key=lambda item: -item.score)
        return results[:top_k]


def test_keyword_retrieval_and_filtering() -> None:
    retriever = KeywordRetriever([
        RAGDocument("python", "Python supports asynchronous programming",
                    {"category": "programming"}),
        RAGDocument("garden", "Gardening requires water and sunlight",
                    {"category": "hobby"}),
    ])

    results = asyncio.run(
        retriever.retrieve("Python asynchronous", filters={"category": "programming"})
    )

    assert len(results) == 1
    assert results[0].document.document_id == "python"
    assert results[0].rank == 1


def test_vector_adapter_add_and_retrieve() -> None:
    store = ContractTestStore()
    retriever = VectorRetriever(store)

    document = RAGDocument(
        "doc-1",
        "ModelNow routes AI requests",
        {"category": "ai"},
    )
    retriever.add_documents([document])

    results = asyncio.run(
        retriever.retrieve("ModelNow routes", filters={"category": "ai"})
    )

    assert len(results) == 1
    assert results[0].document.document_id == "doc-1"
    assert results[0].rank == 1


def test_vector_adapter_validation() -> None:
    retriever = VectorRetriever(ContractTestStore())

    try:
        asyncio.run(retriever.retrieve("   "))
    except ValueError:
        pass
    else:
        raise AssertionError("Empty queries must be rejected.")

    try:
        retriever.add_documents([
            RAGDocument("same", "First document"),
            RAGDocument("same", "Second document"),
        ])
    except ValueError:
        pass
    else:
        raise AssertionError("Duplicate IDs must be rejected.")


def test_in_memory_contract_is_preserved() -> None:
    retriever = InMemoryRetriever([
        RAGDocument("doc-1", "RAG retrieval"),
    ])
    results = asyncio.run(retriever.retrieve("RAG"))

    assert len(results) == 1
    assert results[0].document.document_id == "doc-1"


def main() -> None:
    tests = [
        test_keyword_retrieval_and_filtering,
        test_vector_adapter_add_and_retrieve,
        test_vector_adapter_validation,
        test_in_memory_contract_is_preserved,
    ]

    for test in tests:
        test()
        print(f"PASS - {test.__name__}")

    print(f"PASS - {len(tests)} retriever tests")


if __name__ == "__main__":
    main()
