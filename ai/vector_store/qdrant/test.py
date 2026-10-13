from .client import QdrantClient
from .collections import QdrantCollectionManager
from .search import QdrantSearch
from .utils import (
    validate_collection_name,
    validate_dimension,
    validate_top_k,
    validate_vector,
    validate_metadata,
    validate_document_id,
)


def expect_error(function, *args, **kwargs):
    try:
        function(*args, **kwargs)
    except (TypeError, ValueError):
        return
    raise AssertionError(
        f"Expected validation failure from {function.__name__}"
    )


def main():
    assert validate_collection_name("modelnow_knowledge") == "modelnow_knowledge"
    assert validate_dimension(384) == 384
    assert validate_top_k(5) == 5
    assert validate_document_id("document-1") == "document-1"
    print("PASS: collection, dimension, top-k, and document ID validation")

    vector = validate_vector([0.1, 0.2, 0.3], dimension=3)
    assert vector == [0.1, 0.2, 0.3]
    assert validate_metadata({"source": "test"}) == {"source": "test"}
    assert validate_metadata(None) == {}
    print("PASS: vector and metadata validation")

    expect_error(validate_collection_name, "invalid collection name!")
    expect_error(validate_dimension, 0)
    expect_error(validate_top_k, 0)
    expect_error(validate_vector, [0.1, float("nan")])
    expect_error(validate_vector, [0.1, 0.2], dimension=3)
    expect_error(validate_metadata, ["invalid"])
    expect_error(validate_document_id, "")
    print("PASS: invalid inputs rejected")

    client = QdrantClient(url="http://localhost:6333")
    manager = QdrantCollectionManager(client)
    search = QdrantSearch(client)

    assert client.initialized is False
    assert manager.client is client
    assert search.client is client
    client.close()

    print("PASS: client, collection manager, and search initialization")
    print("INFO: live Qdrant connection not required for offline tests")
    print("MODELNOW QDRANT CONSOLIDATED TEST: PASS")


if __name__ == "__main__":
    main()
