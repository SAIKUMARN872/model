"""Consolidated real ChromaDB tests for ModelNow."""

import gc
import math
import shutil
import time
from pathlib import Path

from ai.vector_store.chroma.client import ChromaVectorClient
from ai.vector_store.chroma.collections import ChromaCollectionManager
from ai.vector_store.chroma.search import ChromaSearch
from ai.vector_store.models import VectorDocument


def run_tests() -> None:
    test_root = Path(".modelnow_test/chroma_consolidated").resolve()
    database_path = test_root / "db"
    collection_name = "modelnow-chroma-test"
    client = None

    try:
        test_root.mkdir(parents=True, exist_ok=True)
        client = ChromaVectorClient(database_path)
        client.connect()

        manager = ChromaCollectionManager(client)
        searcher = ChromaSearch(client)

        try:
            client.delete_collection(collection_name)
        except Exception:
            pass

        manager.get_or_create(collection_name)

        count = manager.add_documents(
            collection_name,
            [
                VectorDocument(
                    "ai-routing",
                    "ModelNow routes AI prompts to suitable language models.",
                    {"topic": "ai"},
                    [1.0, 0.0, 0.0],
                ),
                VectorDocument(
                    "ai-cost",
                    "ModelNow optimizes inference cost and latency.",
                    {"topic": "ai"},
                    [0.9, 0.1, 0.0],
                ),
                VectorDocument(
                    "cooking",
                    "A recipe explains how to prepare vegetable soup.",
                    {"topic": "cooking"},
                    [0.0, 1.0, 0.0],
                ),
            ],
        )
        assert count == 3
        assert manager.count(collection_name) == 3
        print("PASS: document insertion and collection count")

        document = manager.get_document(collection_name, "ai-routing")
        assert document is not None
        assert document.text.startswith("ModelNow routes")
        assert document.embedding is not None
        assert all(
            math.isclose(a, b, abs_tol=1e-5)
            for a, b in zip(document.embedding, [1.0, 0.0, 0.0], strict=True)
        )
        print("PASS: document retrieval and embeddings")

        manager.update_document(
            collection_name,
            VectorDocument(
                "ai-routing",
                "ModelNow automatically routes prompts and balances quality.",
                {"topic": "ai", "updated": True},
                [1.0, 0.0, 0.0],
            ),
        )
        updated = manager.get_document(collection_name, "ai-routing")
        assert updated is not None and updated.metadata["updated"] is True
        assert "balances quality" in updated.text
        print("PASS: document update")

        results = searcher.search_by_embedding(
            collection_name, [1.0, 0.0, 0.0], top_k=3
        )
        assert len(results) == 3
        assert results[0].document.document_id == "ai-routing"
        assert results[0].distance < results[-1].distance
        print("PASS: vector similarity ranking")

        filtered = searcher.search_by_embedding(
            collection_name,
            [1.0, 0.0, 0.0],
            top_k=3,
            filters={"topic": "ai"},
        )
        assert len(filtered) == 2
        assert all(item.document.metadata["topic"] == "ai" for item in filtered)
        print("PASS: metadata-filtered search")

        top_one = searcher.search_by_embedding(
            collection_name, [1.0, 0.0, 0.0], top_k=1
        )
        assert len(top_one) == 1
        assert top_one[0].document.document_id == "ai-routing"
        print("PASS: top-k limit")

        info = manager.describe(collection_name)
        assert info.name == collection_name and info.count == 3
        print("PASS: collection metadata")

        deleted = manager.delete_documents(collection_name, ["cooking"])
        assert deleted == 1 and manager.count(collection_name) == 2
        assert manager.get_document(collection_name, "cooking") is None
        print("PASS: document deletion")

        print("MODELNOW CHROMADB CONSOLIDATED TEST: PASS")

    finally:
        if client is not None:
            try:
                client.delete_collection(collection_name)
            except Exception:
                pass
            client.close()
            del client

        gc.collect()
        time.sleep(0.5)
        try:
            shutil.rmtree(test_root)
        except PermissionError:
            print("NOTE: Windows retained a ChromaDB file lock; test data remains.")


if __name__ == "__main__":
    run_tests()
