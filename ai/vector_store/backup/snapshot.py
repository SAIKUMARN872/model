"""Portable, checksummed snapshot format for ModelNow."""

from __future__ import annotations

from datetime import datetime, timezone
from collections.abc import Mapping, Sequence
from typing import Any

from .utils import calculate_checksum, validate_json_value


SNAPSHOT_FORMAT = "modelnow-vector-store-snapshot"
SNAPSHOT_VERSION = 1


def create_snapshot(
    collection_name: str,
    documents: Sequence[Mapping[str, Any]],
    metadata: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    if not isinstance(collection_name, str) or not collection_name.strip():
        raise ValueError("collection_name must be a non-empty string")
    if isinstance(documents, (str, bytes)) or not isinstance(documents, Sequence):
        raise ValueError("documents must be a sequence")

    normalized_documents: list[dict[str, Any]] = []
    seen_ids: set[str] = set()

    for index, document in enumerate(documents):
        if not isinstance(document, Mapping):
            raise ValueError(f"document at index {index} must be a mapping")

        doc_id = document.get("document_id", document.get("id"))
        if not isinstance(doc_id, str) or not doc_id.strip():
            raise ValueError(f"document at index {index} requires a document_id")
        doc_id = doc_id.strip()
        if doc_id in seen_ids:
            raise ValueError(f"duplicate document ID: {doc_id}")
        seen_ids.add(doc_id)

        text = document.get("text", "")
        if not isinstance(text, str):
            raise ValueError(f"document {doc_id} text must be a string")

        doc_metadata = document.get("metadata", {})
        if not isinstance(doc_metadata, Mapping):
            raise ValueError(f"document {doc_id} metadata must be a mapping")

        record: dict[str, Any] = {
            "document_id": doc_id,
            "text": text,
            "metadata": dict(doc_metadata),
        }
        if "embedding" in document:
            embedding = document["embedding"]
            if not isinstance(embedding, (list, tuple)) or not embedding:
                raise ValueError(f"document {doc_id} embedding must be a non-empty sequence")
            record["embedding"] = list(embedding)
        normalized_documents.append(record)

    snapshot: dict[str, Any] = {
        "format": SNAPSHOT_FORMAT,
        "version": SNAPSHOT_VERSION,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "collection_name": collection_name.strip(),
        "metadata": dict(metadata or {}),
        "document_count": len(normalized_documents),
        "documents": normalized_documents,
    }
    validate_json_value(snapshot, "snapshot")
    snapshot["checksum_sha256"] = calculate_checksum(snapshot)
    return snapshot


def validate_snapshot(snapshot: Mapping[str, Any]) -> dict[str, Any]:
    if not isinstance(snapshot, Mapping):
        raise ValueError("snapshot must be a mapping")

    data = dict(snapshot)
    checksum = data.pop("checksum_sha256", None)

    if data.get("format") != SNAPSHOT_FORMAT:
        raise ValueError("unsupported snapshot format")
    if data.get("version") != SNAPSHOT_VERSION:
        raise ValueError("unsupported snapshot version")
    if not isinstance(checksum, str) or not checksum:
        raise ValueError("snapshot checksum is missing")
    if calculate_checksum(data) != checksum:
        raise ValueError("snapshot checksum verification failed")

    documents = data.get("documents")
    if not isinstance(documents, list):
        raise ValueError("snapshot documents must be a list")
    if data.get("document_count") != len(documents):
        raise ValueError("snapshot document count does not match")
    if not isinstance(data.get("collection_name"), str) or not data["collection_name"].strip():
        raise ValueError("snapshot collection name is invalid")
    if not isinstance(data.get("metadata", {}), dict):
        raise ValueError("snapshot metadata must be a mapping")

    # Validate each record and enforce unique stable IDs.
    seen: set[str] = set()
    for record in documents:
        if not isinstance(record, dict):
            raise ValueError("each snapshot document must be a mapping")
        doc_id = record.get("document_id")
        if not isinstance(doc_id, str) or not doc_id.strip() or doc_id in seen:
            raise ValueError("snapshot contains a missing or duplicate document ID")
        seen.add(doc_id)
        if not isinstance(record.get("text"), str):
            raise ValueError(f"document {doc_id} text is invalid")
        if not isinstance(record.get("metadata", {}), dict):
            raise ValueError(f"document {doc_id} metadata is invalid")
        validate_json_value(record, f"document {doc_id}")

    validate_json_value(data, "snapshot")
    return {**data, "checksum_sha256": checksum}
