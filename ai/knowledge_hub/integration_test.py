import gc
import tempfile
from pathlib import Path

from ai.knowledge_hub.knowledge.management.service import KnowledgeService


def check(condition, message):
    if not condition:
        raise AssertionError(message)
    print(f"PASS: {message}")


def main():
    with tempfile.TemporaryDirectory(prefix="modelnow-kh-test-") as temp:
        root = Path(temp)
        document = root / "employee_handbook.txt"
        document.write_text(
            "Employees can reset their account password by opening "
            "the account settings page, selecting Security, and choosing "
            "Reset Password. A verification code is required.",
            encoding="utf-8",
        )

        service = KnowledgeService(data_dir=root / "knowledge")
        try:
            record = service.ingest_file(str(document))
            check(record["status"] == "indexed", "Document ingestion completed")
            check(record["chunk_count"] >= 1, "Document was split into chunks")
            check(
                service.indexer.count_chunks("default") >= 1,
                "Chunks were stored in persistent ChromaDB",
            )

            result = service.ask(
                "How can an employee reset their account password?",
                collection_id="default",
                top_k=3,
            )
            check(bool(result["sources"]), "Question returned source passages")
            check(
                any("password" in item["text"].lower()
                    for item in result["sources"]),
                "Retrieved passages contain relevant password information",
            )
            check(
                any(item["filename"] == document.name
                    for item in result["sources"]),
                "Retrieved source identifies the original document",
            )

            document_id = record["document_id"]
            check(
                service.delete_document(document_id),
                "Document deletion completed",
            )
            check(
                service.indexer.count_chunks("default") == 0,
                "Deleted document chunks were removed from the vector index",
            )

            print("\nMODELNOW KNOWLEDGE HUB INTEGRATION TEST: PASS")
        finally:
            service.indexer.close()
            del service
            gc.collect()


if __name__ == "__main__":
    main()
