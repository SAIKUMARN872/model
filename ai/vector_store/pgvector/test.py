from .client import PgVectorClient
from .schema import PgVectorSchema
from .search import PgVectorSearch
from .utils import (
    validate_collection_name,
    validate_dimension,
    validate_top_k,
    validate_embedding,
    validate_metadata,
    validate_document_id,
)


def expect_error(function, *args, **kwargs):
    try:
        function(*args, **kwargs)
    except (TypeError, ValueError):
        return
    raise AssertionError(f"Expected validation failure from {function.__name__}")


def main():
    assert validate_collection_name("knowledge_docs") == "knowledge_docs"
    assert validate_dimension(384) == 384
    assert validate_top_k(5) == 5
    assert validate_document_id("doc-1") == "doc-1"
    print("PASS: collection, dimension, top-k, and document ID validation")

    embedding = validate_embedding([0.1, 0.2, 0.3], 3)
    assert embedding == [0.1, 0.2, 0.3]
    assert validate_metadata({"source": "test"}) == {"source": "test"}
    assert validate_metadata(None) == {}
    print("PASS: embedding and metadata validation")

    expect_error(validate_collection_name, "bad-name")
    expect_error(validate_collection_name, "x; DROP TABLE users")
    expect_error(validate_dimension, 0)
    expect_error(validate_top_k, 0)
    expect_error(validate_embedding, [0.1, float("nan")])
    expect_error(validate_embedding, [0.1, 0.2], 3)
    expect_error(validate_metadata, ["not", "a", "dict"])
    expect_error(validate_document_id, "")
    print("PASS: invalid inputs rejected")

    client = PgVectorClient(dsn=None)
    schema = PgVectorSchema(client, "test_documents", 3)
    search = PgVectorSearch(client)

    assert client.connected is False
    assert schema.collection_name == "test_documents"
    assert schema.dimension == 3
    assert search.client is client
    client.close()
    print("PASS: client, schema manager, and search initialization")
    print("INFO: PostgreSQL connection not required for offline tests")
    print("MODELNOW PGVECTOR CONSOLIDATED TEST: PASS")


if __name__ == "__main__":
    main()
