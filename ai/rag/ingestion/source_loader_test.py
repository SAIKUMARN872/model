import tempfile
from pathlib import Path

from ai.rag.ingestion import RAGIndexer, RAGIngestionPipeline, RAGSourceIngestion
from ai.rag.models import RAGDocument


class InMemorySink:
    def __init__(self):
        self.documents = []

    def add_documents(self, documents):
        existing_ids = {item.document_id for item in self.documents}
        new_ids = [item.document_id for item in documents]

        if len(new_ids) != len(set(new_ids)):
            raise ValueError("Duplicate IDs in batch.")
        if existing_ids.intersection(new_ids):
            raise ValueError("Document already exists.")

        self.documents.extend(documents)


def run_test(name, function):
    try:
        function()
        print(f"PASS - {name}")
    except Exception as exc:
        print(f"FAIL - {name}: {exc}")
        raise


def test_single_source_ingestion():
    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / "notes.txt"
        path.write_text("ModelNow connects document loading to RAG indexing.", encoding="utf-8")

        sink = InMemorySink()
        pipeline = RAGIngestionPipeline(RAGIndexer(sink))
        integration = RAGSourceIngestion(pipeline)
        chunks = integration.ingest_source(path)

        assert chunks
        assert sink.documents
        assert sink.documents[0].metadata["filename"] == "notes.txt"
        assert sink.documents[0].metadata["source_document_id"]


def test_batch_source_ingestion():
    with tempfile.TemporaryDirectory() as directory:
        first = Path(directory) / "first.txt"
        second = Path(directory) / "second.txt"
        first.write_text("First document for ModelNow.", encoding="utf-8")
        second.write_text("Second document for ModelNow.", encoding="utf-8")

        sink = InMemorySink()
        integration = RAGSourceIngestion(
            RAGIngestionPipeline(RAGIndexer(sink))
        )
        chunks = integration.ingest_sources([first, second])

        assert len(chunks) >= 2
        assert len(sink.documents) == len(chunks)
        source_ids = {item.metadata["source_document_id"] for item in chunks}
        assert len(source_ids) == 2


def test_invalid_source():
    sink = InMemorySink()
    integration = RAGSourceIngestion(RAGIngestionPipeline(RAGIndexer(sink)))

    try:
        integration.ingest_source("this-file-does-not-exist.txt")
    except FileNotFoundError:
        assert not sink.documents
        return

    raise AssertionError("Missing source was accepted")


def test_batch_rejects_invalid_source_before_indexing():
    with tempfile.TemporaryDirectory() as directory:
        valid = Path(directory) / "valid.txt"
        valid.write_text("Valid document.", encoding="utf-8")

        sink = InMemorySink()
        integration = RAGSourceIngestion(RAGIngestionPipeline(RAGIndexer(sink)))

        try:
            integration.ingest_sources([valid, Path(directory) / "missing.txt"])
        except FileNotFoundError:
            assert not sink.documents
            return

        raise AssertionError("Invalid batch source was accepted")


def main():
    print("MODELNOW RAG SOURCE INGESTION TEST")
    run_test("SINGLE SOURCE LOADING AND INDEXING", test_single_source_ingestion)
    run_test("BATCH SOURCE LOADING AND INDEXING", test_batch_source_ingestion)
    run_test("MISSING SOURCE VALIDATION", test_invalid_source)
    run_test("BATCH VALIDATION BEFORE INDEXING", test_batch_rejects_invalid_source_before_indexing)
    print("PASS - RAG SOURCE INGESTION INTEGRATION TEST")


if __name__ == "__main__":
    main()
