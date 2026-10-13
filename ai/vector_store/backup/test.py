"""Consolidated offline tests for ModelNow vector-store backups."""

from __future__ import annotations

import tempfile
from pathlib import Path

from .backup import VectorStoreBackup
from .restore import VectorStoreRestore
from .snapshot import create_snapshot, validate_snapshot


DOCUMENTS = [
    {
        "document_id": "doc-1",
        "text": "ModelNow vector search",
        "metadata": {"category": "AI", "source": "guide"},
        "embedding": [0.1, 0.2, 0.3],
    },
    {
        "document_id": "doc-2",
        "text": "ModelNow backup and recovery",
        "metadata": {"category": "operations"},
    },
]


def expect_value_error(operation, label: str) -> None:
    try:
        operation()
    except ValueError:
        return
    raise AssertionError(f"Expected ValueError: {label}")


def run_tests() -> None:
    snapshot = create_snapshot(
        "ModelNowDocuments",
        DOCUMENTS,
        metadata={"backend": "offline-test"},
    )
    verified = validate_snapshot(snapshot)
    assert verified["document_count"] == 2
    assert verified["documents"][0]["embedding"] == [0.1, 0.2, 0.3]
    assert len(verified["checksum_sha256"]) == 64
    print("PASS: snapshot format, document normalization, and checksum")

    tampered = dict(snapshot)
    tampered["documents"] = [dict(snapshot["documents"][0]), dict(snapshot["documents"][1])]
    tampered["documents"][0]["text"] = "tampered content"
    expect_value_error(lambda: validate_snapshot(tampered), "tampered checksum")

    bad_count = dict(snapshot)
    bad_count["document_count"] = 99
    expect_value_error(lambda: validate_snapshot(bad_count), "tampered document count")

    expect_value_error(
        lambda: create_snapshot("ModelNowDocuments", [DOCUMENTS[0], DOCUMENTS[0]]),
        "duplicate document IDs",
    )
    expect_value_error(
        lambda: create_snapshot("ModelNowDocuments", [{"text": "missing ID"}]),
        "missing document ID",
    )
    print("PASS: corrupted snapshots and invalid document records rejected")

    backup_service = VectorStoreBackup()
    restore_service = VectorStoreRestore()

    with tempfile.TemporaryDirectory(prefix="modelnow-backup-") as directory:
        path = Path(directory) / "snapshot.json"
        saved = backup_service.save(snapshot, path)
        assert saved.exists()

        loaded = backup_service.load(path)
        assert loaded["checksum_sha256"] == snapshot["checksum_sha256"]
        assert loaded["document_count"] == 2
        print("PASS: JSON persistence, reload, and checksum verification")

        restored_documents = []
        report = restore_service.restore(
            loaded,
            lambda document: restored_documents.append(dict(document)),
            expected_collection="ModelNowDocuments",
        )
        assert report["restored_count"] == 2
        assert restored_documents[0]["document_id"] == "doc-1"
        assert restored_documents[1]["text"] == DOCUMENTS[1]["text"]

        expect_value_error(
            lambda: restore_service.restore(
                loaded,
                lambda document: None,
                expected_collection="DifferentCollection",
            ),
            "collection mismatch",
        )
        expect_value_error(
            lambda: restore_service.restore(loaded, None),
            "invalid restore callback",
        )
        print("PASS: restore callback, document count, and collection safety")

        damaged_path = Path(directory) / "damaged.json"
        damaged_path.write_text("{invalid json", encoding="utf-8")
        expect_value_error(
            lambda: backup_service.load(damaged_path),
            "malformed JSON",
        )
        print("PASS: malformed backup file rejected")

    print("INFO: tests use temporary files and mock restore targets")
    print("MODELNOW VECTOR STORE BACKUP CONSOLIDATED TEST: PASS")


if __name__ == "__main__":
    run_tests()
