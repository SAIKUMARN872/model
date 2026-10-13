from .client import PineconeClient
from .index import PineconeIndex
from .search import PineconeSearch
from .utils import (
    validate_index_name,
    validate_dimension,
    validate_top_k,
    validate_vector,
    validate_metadata,
    validate_vector_id,
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
    assert validate_index_name("modelnow-knowledge") == "modelnow-knowledge"
    assert validate_dimension(384) == 384
    assert validate_top_k(5) == 5
    assert validate_vector_id("document-1") == "document-1"
    print("PASS: index name, dimension, top-k, and vector ID validation")

    vector = validate_vector([0.1, 0.2, 0.3], dimension=3)
    assert vector == [0.1, 0.2, 0.3]
    assert validate_metadata({"source": "test"}) == {"source": "test"}
    assert validate_metadata(None) == {}
    print("PASS: vector and metadata validation")

    expect_error(validate_index_name, "INVALID_INDEX_NAME")
    expect_error(validate_dimension, 0)
    expect_error(validate_top_k, 0)
    expect_error(validate_vector, [0.1, float("nan")])
    expect_error(validate_vector, [0.1, 0.2], dimension=3)
    expect_error(validate_metadata, ["invalid"])
    expect_error(validate_vector_id, "")
    print("PASS: invalid inputs rejected")

    client = PineconeClient(
        api_key=None,
        index_name="modelnow-test",
    )
    index = PineconeIndex(client, index_name="modelnow-test")
    search = PineconeSearch(client, index_name="modelnow-test")

    assert index.client is client
    assert search.client is client
    assert client.initialized is False

    client.close()

    print("PASS: client, index, and search initialization")
    print("INFO: live Pinecone connection not required for offline tests")
    print("MODELNOW PINECONE CONSOLIDATED TEST: PASS")


if __name__ == "__main__":
    main()
