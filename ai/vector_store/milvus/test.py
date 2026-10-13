"""Consolidated offline tests for the ModelNow Milvus backend."""

from ai.vector_store.milvus import (
    MilvusClient,
    MilvusCollectionManager,
    MilvusSearch,
    validate_collection_name,
    validate_dimension,
    validate_embedding,
    validate_metadata,
    validate_top_k,
)


def main() -> None:
    assert validate_collection_name("modelnow_knowledge") == "modelnow_knowledge"
    assert validate_dimension(384) == 384
    assert validate_top_k(5) == 5
    print("PASS: collection, dimension, and top-k validation")

    vector = validate_embedding([0.25, 0.5], 2)
    assert vector == [0.25, 0.5]
    assert validate_metadata({"source": "test"}) == {"source": "test"}
    print("PASS: embedding and metadata validation")

    invalid_cases = [
        (lambda: validate_collection_name("bad-name"), ValueError),
        (lambda: validate_dimension(0), ValueError),
        (lambda: validate_top_k(0), ValueError),
        (lambda: validate_embedding([1.0], 2), ValueError),
        (lambda: validate_embedding([float("nan")]), ValueError),
        (lambda: validate_metadata(["invalid"]), TypeError),
    ]
    for operation, expected_error in invalid_cases:
        try:
            operation()
        except expected_error:
            continue
        raise AssertionError(f"Expected {expected_error.__name__}")

    print("PASS: invalid inputs rejected")

    client = MilvusClient(uri="http://localhost:19530")
    manager = MilvusCollectionManager(client)
    search = MilvusSearch(client)
    assert manager.client is client
    assert search.client is client
    print("PASS: client, collection manager, and search initialization")

    try:
        client.connect()
    except (RuntimeError, ConnectionError):
        # SDK may be missing or the local server may not be running.
        print("INFO: live Milvus connection not required for offline tests")

    print("MODELNOW MILVUS CONSOLIDATED TEST: PASS")


if __name__ == "__main__":
    main()
