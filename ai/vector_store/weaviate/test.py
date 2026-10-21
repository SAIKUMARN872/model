"""Consolidated offline tests for ModelNow Weaviate integration."""

from __future__ import annotations

from types import SimpleNamespace

from .client import WeaviateClient
from .schema import WeaviateSchema
from .search import WeaviateSearch
from .utils import (
    validate_collection_name,
    validate_dimension,
    validate_document_id,
    validate_metadata,
    validate_text,
    validate_top_k,
    validate_vector,
)


class FakeQuery:
    def __init__(self, objects):
        self.objects = objects
        self.last_args = None

    def near_vector(self, **kwargs):
        self.last_args = kwargs
        return SimpleNamespace(objects=self.objects)


class FakeCollections:
    def __init__(self, collection):
        self.collection = collection

    def get(self, name):
        assert name == "ModelNowDocument"
        return self.collection


class FakeCollection:
    def __init__(self):
        self.query = FakeQuery([
            SimpleNamespace(
                uuid="uuid-1",
                properties={
                    "document_id": "doc-1",
                    "text": "ModelNow vector search",
                    "metadata_json": '{"category":"AI","active":true}',
                },
                metadata=SimpleNamespace(distance=0.1, certainty=0.9),
            ),
            SimpleNamespace(
                uuid="uuid-2",
                properties={
                    "document_id": "doc-2",
                    "text": "Database guide",
                    "metadata_json": '{"category":"database"}',
                },
                metadata=SimpleNamespace(distance=0.4, certainty=0.6),
            ),
        ])


def run_tests() -> None:
    assert validate_collection_name("ModelNowDocument") == "ModelNowDocument"
    assert validate_dimension(384) == 384
    assert validate_top_k(5) == 5
    assert validate_document_id("doc-1") == "doc-1"
    assert validate_text("  example text  ") == "example text"
    assert validate_metadata({"category": "AI"}) == {"category": "AI"}
    assert validate_vector([0.1, 0.2], 2) == [0.1, 0.2]
    print("PASS: collection, dimension, top-k, ID, text, and vector validation")

    invalid_cases = [
        lambda: validate_collection_name("bad-name"),
        lambda: validate_collection_name("1StartsWithNumber"),
        lambda: validate_dimension(0),
        lambda: validate_top_k(True),
        lambda: validate_document_id(" "),
        lambda: validate_text(" "),
        lambda: validate_vector([1.0, float("nan")]),
        lambda: validate_vector([1.0], 2),
        lambda: validate_metadata(["not", "a", "mapping"]),
    ]
    for operation in invalid_cases:
        try:
            operation()
        except ValueError:
            continue
        raise AssertionError("invalid input was accepted")
    print("PASS: invalid inputs rejected")

    fake_collection = FakeCollection()
    raw_client = SimpleNamespace(
        collections=FakeCollections(fake_collection),
        is_ready=lambda: True,
    )
    client = WeaviateClient(client=raw_client)
    assert client.initialized
    assert client.raw_client is raw_client
    assert client.is_ready()
    client.close()
    assert client.initialized  # Injected clients are not owned or closed.

    schema = WeaviateSchema(raw_client, "ModelNowDocument")
    search = WeaviateSearch(raw_client, "ModelNowDocument")
    assert schema.collection_name == search.collection_name
    print("PASS: client lifecycle and schema/search initialization")

    results = search.search([0.1, 0.2, 0.3], top_k=2)
    assert len(results) == 2
    assert results[0]["document_id"] == "doc-1"
    assert abs(results[0]["score"] - 0.9) < 1e-9
    assert fake_collection.query.last_args["limit"] == 2
    print("PASS: vector-search result normalization and distance scoring")

    filtered = search.search(
        [0.1, 0.2, 0.3],
        top_k=5,
        filters={"category": "AI"},
    )
    assert len(filtered) == 1
    assert filtered[0]["document_id"] == "doc-1"
    print("PASS: metadata filtering and top-k behavior")

    assert search.search([0.1], top_k=1)[0]["document_id"] == "doc-1"
    print("INFO: live Weaviate server not required for offline tests")
    print("MODELNOW WEAVIATE CONSOLIDATED TEST: PASS")


if __name__ == "__main__":
    run_tests()
