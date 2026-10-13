from .client import RedisVectorClient
from .index import RedisVectorIndex
from .search import RedisVectorSearch
from .utils import (
    validate_index_name,
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
    assert validate_index_name("modelnow_vectors") == "modelnow_vectors"
    assert validate_dimension(384) == 384
    assert validate_top_k(5) == 5
    assert validate_document_id("document-1") == "document-1"
    print("PASS: index name, dimension, top-k, and document ID validation")

    vector = validate_vector([0.1, 0.2, 0.3], dimension=3)
    assert vector == [0.1, 0.2, 0.3]
    assert validate_metadata({"source": "test"}) == {"source": "test"}
    assert validate_metadata(None) == {}
    print("PASS: vector and metadata validation")

    expect_error(validate_index_name, "invalid index name!")
    expect_error(validate_dimension, 0)
    expect_error(validate_top_k, 0)
    expect_error(validate_vector, [0.1, float("nan")])
    expect_error(validate_vector, [0.1, 0.2], dimension=3)
    expect_error(validate_metadata, ["invalid"])
    expect_error(validate_document_id, "")
    print("PASS: invalid inputs rejected")

    client = RedisVectorClient()
    index = RedisVectorIndex(client, index_name="modelnow-test")
    search = RedisVectorSearch(client, index_name="modelnow-test")

    assert client.initialized is False
    assert index.client is client
    assert search.client is client
    assert index.index_name == search.index_name == "modelnow-test"
    client.close()

    print("PASS: client, index, and search initialization")
    print("INFO: live Redis connection not required for offline tests")
    print("MODELNOW REDIS VECTOR CONSOLIDATED TEST: PASS")


if __name__ == "__main__":
    main()
