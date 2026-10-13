"""Backup creation and persistence for ModelNow vector stores."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Any

from .snapshot import create_snapshot, validate_snapshot
from .utils import atomic_write_json, read_json


class VectorStoreBackup:
    def create(
        self,
        collection_name: str,
        documents: Sequence[Mapping[str, Any]],
        metadata: Mapping[str, Any] | None = None,
    ) -> dict[str, Any]:
        return create_snapshot(collection_name, documents, metadata)

    def save(
        self,
        snapshot: Mapping[str, Any],
        destination: str | Path,
    ) -> Path:
        verified = validate_snapshot(snapshot)
        return atomic_write_json(destination, verified)

    def backup(
        self,
        collection_name: str,
        documents: Sequence[Mapping[str, Any]],
        destination: str | Path,
        metadata: Mapping[str, Any] | None = None,
    ) -> dict[str, Any]:
        snapshot = self.create(collection_name, documents, metadata)
        path = self.save(snapshot, destination)
        return {
            "path": str(path),
            "collection_name": snapshot["collection_name"],
            "document_count": snapshot["document_count"],
            "checksum_sha256": snapshot["checksum_sha256"],
        }

    def load(self, source: str | Path) -> dict[str, Any]:
        return validate_snapshot(read_json(source))
