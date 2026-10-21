"""Live integration test for ModelNow's Weaviate adapter."""

from __future__ import annotations

import os
import time
import uuid

from ai.vector_store.weaviate import (
    WeaviateClient,
    WeaviateSchema,
    WeaviateSearch,
)


def main() -> int:
    if not os.getenv("WEAVIATE_URL") or not os.getenv("WEAVIATE_API_KEY"):
        print("FAIL: WEAVIATE_URL and WEAVIATE_API_KEY must be configured.")
        return 1

    collection_name = "ModelNowAdapterTest" + uuid.uuid4().hex[:10]
    adapter_client = WeaviateClient()
    raw_client = None
    success = False

    try:
        print("Connecting through ModelNow WeaviateClient...")
        raw_client = adapter_client.connect()

        if not adapter_client.is_ready():
            raise RuntimeError("Weaviate client is not ready.")
        print("PASS: ModelNow client connection and readiness")

        schema = WeaviateSchema(raw_client, collection_name)
        schema.create(dimension=3)
        print("PASS: ModelNow schema created collection")

        first_id = "doc-" + uuid.uuid4().hex
        second_id = "doc-" + uuid.uuid4().hex

        schema.upsert(
            first_id,
            "ModelNow AI vector search",
            [1.0, 0.0, 0.0],
            {"category": "AI", "version": 1},
        )
        schema.upsert(
            second_id,
            "ModelNow database storage",
            [0.0, 1.0, 0.0],
            {"category": "database"},
        )
        print("PASS: Adapter inserted two documents")

        # Verify deterministic-ID upsert updates an existing document.
        schema.upsert(
            first_id,
            "ModelNow AI vector search updated",
            [0.9, 0.1, 0.0],
            {"category": "AI", "version": 2},
        )

        fetched = None
        for attempt in range(1, 6):
            fetched = schema.fetch(first_id)
            if fetched is not None:
                break
            print(f"Waiting for document visibility: attempt {attempt}")
            time.sleep(2)

        if fetched is None:
            raise RuntimeError("Inserted document could not be fetched.")

        if fetched["text"] != "ModelNow AI vector search updated":
            raise RuntimeError("Upsert did not update the existing document.")

        if fetched["metadata"].get("version") != 2:
            raise RuntimeError("Updated metadata was not persisted.")

        print("PASS: Fetch and update/upsert")

        search = WeaviateSearch(raw_client, collection_name)
        results = []
        first_result_id = None

        for attempt in range(1, 11):
            results = search.search([1.0, 0.0, 0.0], top_k=2)
            first_result_id = (
                results[0]["document_id"] if results else None
            )
            print(
                f"Adapter search attempt {attempt}: "
                f"{len(results)} result(s); first={first_result_id}"
            )

            if first_result_id == first_id:
                break

            time.sleep(2)

        if first_result_id != first_id:
            raise RuntimeError(
                "Expected updated document to rank first; "
                f"expected={first_id}, actual={first_result_id}"
            )

        print("PASS: Adapter vector search and ranking")

        filtered = search.search(
            [1.0, 0.0, 0.0],
            top_k=5,
            filters={"category": "AI"},
        )
        if not filtered or any(
            item["metadata"].get("category") != "AI" for item in filtered
        ):
            raise RuntimeError("Adapter metadata filtering failed.")

        print("PASS: Adapter metadata filtering")

        deleted = schema.delete([first_id, second_id])
        if deleted != 2:
            raise RuntimeError(f"Expected 2 deleted documents, got {deleted}")

        if schema.fetch(first_id) is not None:
            raise RuntimeError("Deleted document remains retrievable.")

        print("PASS: Adapter document deletion")
        success = True

    except Exception as exc:
        print(f"FAIL: {type(exc).__name__}: {exc}")

    finally:
        if raw_client is not None:
            try:
                if raw_client.collections.exists(collection_name):
                    raw_client.collections.delete(collection_name)
                    print("PASS: Temporary collection cleanup")
            except Exception as exc:
                success = False
                print(f"CLEANUP FAIL: {type(exc).__name__}: {exc}")
        adapter_client.close()

    if success:
        print("MODELNOW WEAVIATE ADAPTER LIVE TEST: PASS")
        return 0

    print("MODELNOW WEAVIATE ADAPTER LIVE TEST: FAIL")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())

