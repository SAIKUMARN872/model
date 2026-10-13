"""Consolidated standalone tests for ModelNow vector indexing."""

from ai.vector_store.indexing import (
    IndexingDocumentBuilder,
    IndexingOptimizer,
    VectorIndexer,
    estimate_text_tokens,
    generate_document_id,
    validate_batch_size,
)
from ai.vector_store.models import VectorDocument


class MockVectorStore:
    def __init__(self):
        self.collections = {}

    def add_documents(self, collection_name, documents):
        collection = self.collections.setdefault(collection_name, {})
        for document in documents:
            collection[document.document_id] = document
        return len(documents)


def main():
    builder = IndexingDocumentBuilder(chunk_size=10, chunk_overlap=2)
    document = builder.build("ModelNow indexing", document_id="doc-1")
    assert document.document_id == "doc-1"
    assert document.text == "ModelNow indexing"
    print("PASS: document construction")

    docs = builder.build_many(
        ["first document", "second document"],
        namespace="test",
    )
    assert len(docs) == 2
    assert docs[0].document_id != docs[1].document_id
    print("PASS: multiple documents and stable IDs")

    chunks = builder.build_chunks(
        "0123456789abcdefghij",
        document_id="source-1",
    )
    assert len(chunks) > 1
    assert chunks[0].metadata["chunk_index"] == 0
    assert all("source_document_id" in item.metadata for item in chunks)
    print("PASS: text chunking and source metadata")

    repeated = [
        VectorDocument("same-id", "first version"),
        VectorDocument("same-id", "second version"),
        VectorDocument("other-id", "another document"),
    ]
    unique = IndexingOptimizer.deduplicate(repeated)
    assert len(unique) == 2
    assert unique[0].text == "first version"
    print("PASS: duplicate-ID handling")

    batches = list(IndexingOptimizer.batches(docs, batch_size=1))
    assert len(batches) == 2
    assert all(len(batch) == 1 for batch in batches)
    print("PASS: batch splitting")

    backend = MockVectorStore()
    indexer = VectorIndexer(backend, batch_size=1)
    result = indexer.index_documents("modelnow_test", repeated)

    assert result.input_count == 3
    assert result.unique_count == 2
    assert result.indexed_count == 2
    assert result.batch_count == 2
    assert result.skipped_duplicates == 1
    assert len(backend.collections["modelnow_test"]) == 2
    print("PASS: end-to-end indexing and statistics")

    text_result = indexer.index_texts(
        "text_test",
        ["alpha", "beta"],
        namespace="unit-test",
    )
    assert text_result.indexed_count == 2
    print("PASS: raw-text indexing")

    assert generate_document_id("abc") == generate_document_id("abc")
    assert estimate_text_tokens("abcdefgh") == 2
    assert validate_batch_size(64) == 64

    try:
        validate_batch_size(0)
    except ValueError:
        pass
    else:
        raise AssertionError("Invalid batch size was accepted")

    try:
        builder.build("")
    except ValueError:
        pass
    else:
        raise AssertionError("Empty text was accepted")
    print("PASS: validation and token estimation")

    print("MODELNOW VECTOR INDEXING CONSOLIDATED TEST: PASS")


if __name__ == "__main__":
    main()
