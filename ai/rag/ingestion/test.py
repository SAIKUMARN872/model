import asyncio

from ai.rag.ingestion import (
    IngestionScheduler,
    JobStatus,
    RAGIndexer,
    RAGIngestionPipeline,
)
from ai.rag.retriever.retriever import InMemoryRetriever


def main() -> None:
    retriever = InMemoryRetriever()
    pipeline = RAGIngestionPipeline(RAGIndexer(retriever))

    indexed = pipeline.ingest(
        "modelnow-doc",
        "ModelNow routes AI requests by cost latency and quality.",
        {"category": "architecture"},
    )
    assert indexed
    assert all(
        item.metadata["source_document_id"] == "modelnow-doc"
        for item in indexed
    )
    print("PASS - DOCUMENT CHUNKING AND INDEXING")

    assert len({item.document_id for item in indexed}) == len(indexed)
    print("PASS - UNIQUE CHUNK IDS")

    assert all(item.metadata["category"] == "architecture" for item in indexed)
    print("PASS - METADATA PRESERVATION")

    retrieved = asyncio.run(retriever.retrieve("ModelNow AI cost", top_k=5))
    assert retrieved
    print("PASS - RETRIEVAL AFTER INGESTION")

    batch = pipeline.ingest_many([
        {
            "document_id": "second-doc",
            "text": "RAG retrieves relevant context for grounded answers.",
            "metadata": {"category": "rag"},
        },
        {
            "document_id": "third-doc",
            "text": "Chunking prepares documents for search.",
            "metadata": {"category": "ingestion"},
        },
    ])
    assert len(batch) >= 2
    print("PASS - BATCH DOCUMENT INGESTION")

    try:
        pipeline.ingest_many([
            {"document_id": "atomic-good", "text": "This valid document must not be indexed."},
            {"document_id": "atomic-bad", "text": ""},
        ])
    except ValueError:
        pass
    else:
        raise AssertionError("Invalid batch should fail validation.")

    after_failure = asyncio.run(
        retriever.retrieve("atomic-good valid document", top_k=5)
    )
    assert not any(
        item.document.document_id.startswith("atomic-good:")
        for item in after_failure
    )
    print("PASS - VALIDATION BEFORE BATCH WRITE")

    try:
        pipeline.ingest("modelnow-doc", "Duplicate source ID must fail.")
    except ValueError:
        pass
    else:
        raise AssertionError("Duplicate chunk IDs should be rejected.")
    print("PASS - DUPLICATE ID REJECTION")

    scheduler = IngestionScheduler()
    scheduler.register("sample", lambda: "done")
    result = scheduler.run("sample")
    assert result.succeeded
    assert result.status is JobStatus.SUCCEEDED
    assert result.attempts == 1
    assert result.result == "done"
    assert result.completed_at is not None
    print("PASS - JOB EXECUTION AND METRICS")

    calls = {"count": 0}

    def flaky_job() -> str:
        calls["count"] += 1
        if calls["count"] == 1:
            raise RuntimeError("Temporary failure")
        return "recovered"

    scheduler.register("retry-job", flaky_job, max_attempts=2)
    retry_result = scheduler.run("retry-job")
    assert retry_result.succeeded
    assert retry_result.attempts == 2
    assert retry_result.result == "recovered"
    print("PASS - RETRY AFTER TRANSIENT FAILURE")

    scheduler.register(
        "failed-job",
        lambda: (_ for _ in ()).throw(RuntimeError("Permanent failure")),
        max_attempts=2,
    )
    failed = scheduler.run("failed-job")
    assert not failed.succeeded
    assert failed.status is JobStatus.FAILED
    assert failed.attempts == 2
    assert "Permanent failure" in (failed.error or "")
    print("PASS - FAILURE REPORTING")

    try:
        scheduler.run("missing-job")
    except KeyError:
        pass
    else:
        raise AssertionError("Unknown job must raise KeyError.")
    print("PASS - UNKNOWN JOB HANDLING")

    try:
        scheduler.register("sample", lambda: None)
    except ValueError:
        pass
    else:
        raise AssertionError("Duplicate job registration must fail.")
    print("PASS - DUPLICATE JOB REGISTRATION")

    print("PASS - RAG INGESTION INTEGRATION TEST")


if __name__ == "__main__":
    main()
