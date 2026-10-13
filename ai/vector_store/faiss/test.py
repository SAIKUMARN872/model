"""Consolidated FAISS backend test."""

import shutil
import tempfile
from pathlib import Path

from ai.vector_store.models import VectorDocument
from ai.vector_store.faiss import FaissClient, FaissCollectionManager, FaissSearch


def main() -> None:
    root = Path(tempfile.mkdtemp(prefix="modelnow_faiss_test_"))
    client = FaissClient(root)
    manager = FaissCollectionManager(client)
    search = FaissSearch(client)
    name = "faiss_test_collection"

    try:
        manager.create_collection(name, 3)

        docs = [
            VectorDocument("ai-routing", "AI model routing", {"category": "ai"}, [1, 0, 0]),
            VectorDocument("ai-cost", "AI inference cost", {"category": "ai"}, [0.8, 0.2, 0]),
            VectorDocument("cooking", "Cooking pasta", {"category": "food"}, [0, 0, 1]),
        ]
        assert manager.add_documents(name, docs) == 3
        print("PASS: document insertion")

        assert manager.get_document(name, "ai-routing").text == "AI model routing"
        print("PASS: document retrieval")

        results = search.search_by_embedding(name, [1, 0, 0], top_k=2)
        assert results[0].document.document_id == "ai-routing"
        assert len(results) == 2
        print("PASS: cosine similarity search")

        filtered = search.search_by_embedding(
            name, [1, 0, 0], top_k=3, filters={"category": "food"}
        )
        assert len(filtered) == 1 and filtered[0].document.document_id == "cooking"
        print("PASS: metadata filtering")

        updated = VectorDocument(
            "ai-routing", "Updated routing notes", {"category": "ai"}, [0.9, 0.1, 0]
        )
        manager.update_document(name, updated)
        assert manager.get_document(name, "ai-routing").text == "Updated routing notes"
        print("PASS: document update")

        assert manager.delete_documents(name, ["cooking"]) == 1
        assert manager.get_document(name, "cooking") is None
        print("PASS: document deletion")

        assert manager.list_collections()[0].count == 2
        print("PASS: collection listing")

        client2 = FaissClient(root)
        reloaded = FaissSearch(client2)
        persisted = reloaded.search_by_embedding(name, [1, 0, 0], top_k=1)
        assert persisted[0].document.document_id == "ai-routing"
        print("PASS: index and metadata persistence")

        assert client.delete_collection(name)
        print("PASS: collection deletion")
        print("MODELNOW FAISS CONSOLIDATED TEST: PASS")
    finally:
        shutil.rmtree(root, ignore_errors=True)


if __name__ == "__main__":
    main()
