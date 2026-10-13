"""Validated snapshot restoration through an injected backend adapter."""

from __future__ import annotations

from collections.abc import Callable, Mapping
from pathlib import Path
from typing import Any

from .snapshot import validate_snapshot
from .utils import read_json


class VectorStoreRestore:
    def load_and_validate(self, source: str | Path) -> dict[str, Any]:
        return validate_snapshot(read_json(source))

    def restore(
        self,
        snapshot: Mapping[str, Any],
        upsert_document: Callable[[Mapping[str, Any]], Any],
        *,
        expected_collection: str | None = None,
        allow_collection_mismatch: bool = False,
    ) -> dict[str, Any]:
        verified = validate_snapshot(snapshot)

        source_collection = verified["collection_name"]
        if (
            expected_collection is not None
            and source_collection != expected_collection
            and not allow_collection_mismatch
        ):
            raise ValueError(
                f"snapshot collection {source_collection!r} does not match "
                f"target collection {expected_collection!r}"
            )

        if not callable(upsert_document):
            raise ValueError("upsert_document must be callable")

        restored = 0
        for document in verified["documents"]:
            # Pass a fresh mapping so an adapter cannot mutate the snapshot.
            upsert_document(dict(document))
            restored += 1

        return {
            "source_collection": source_collection,
            "target_collection": expected_collection or source_collection,
            "restored_count": restored,
            "checksum_sha256": verified["checksum_sha256"],
        }
