"""
Index optimization utilities for ModelNow.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .builder import IndexChunk
from .manager import (
    IndexManager,
)
from .utils import (
    content_hash,
    utc_now,
)


@dataclass
class OptimizationConfig:
    """
    Configuration for index optimization.
    """

    remove_duplicates: bool = True

    sort_by_document: bool = False

    remove_empty_chunks: bool = True

    rebuild_hashes: bool = True


@dataclass
class OptimizationReport:
    """
    Results of an optimization operation.
    """

    input_chunks: int

    output_chunks: int

    removed_duplicates: int

    removed_empty: int

    updated_hashes: int

    optimized_at: Any

    def to_dict(self) -> dict[str, Any]:

        return {
            "input_chunks": self.input_chunks,
            "output_chunks": self.output_chunks,
            "removed_duplicates": (
                self.removed_duplicates
            ),
            "removed_empty": (
                self.removed_empty
            ),
            "updated_hashes": (
                self.updated_hashes
            ),
            "optimized_at": (
                self.optimized_at.isoformat()
            ),
        }


class IndexOptimizer:
    """
    Performs lightweight optimization on index chunks.

    The optimizer is backend-independent and therefore works
    with the in-process IndexManager.
    """

    def __init__(
        self,
        config: OptimizationConfig | None = None,
    ) -> None:

        self.config = (
            config
            or OptimizationConfig()
        )

    def optimize_chunks(
        self,
        chunks: list[IndexChunk],
    ) -> tuple[
        list[IndexChunk],
        OptimizationReport,
    ]:

        input_count = len(
            chunks
        )

        working = list(
            chunks
        )

        removed_empty = 0

        if self.config.remove_empty_chunks:

            filtered = []

            for chunk in working:

                if not chunk.text.strip():

                    removed_empty += 1

                    continue

                if not chunk.embedding:

                    removed_empty += 1

                    continue

                filtered.append(
                    chunk
                )

            working = filtered

        removed_duplicates = 0

        if self.config.remove_duplicates:

            seen: set[
                str
            ] = set()

            unique = []

            for chunk in working:

                fingerprint = (
                    chunk.content_hash
                    or content_hash(
                        chunk.text
                    )
                )

                if fingerprint in seen:

                    removed_duplicates += 1

                    continue

                seen.add(
                    fingerprint
                )

                unique.append(
                    chunk
                )

            working = unique

        updated_hashes = 0

        if self.config.rebuild_hashes:

            for chunk in working:

                new_hash = content_hash(
                    chunk.text
                )

                if (
                    chunk.content_hash
                    != new_hash
                ):

                    chunk.content_hash = (
                        new_hash
                    )

                    chunk.metadata[
                        "content_hash"
                    ] = new_hash

                    updated_hashes += 1

        if self.config.sort_by_document:

            working.sort(
                key=lambda chunk: (
                    chunk.document_id,
                    chunk.chunk_index,
                )
            )

        report = OptimizationReport(
            input_chunks=input_count,
            output_chunks=len(
                working
            ),
            removed_duplicates=(
                removed_duplicates
            ),
            removed_empty=(
                removed_empty
            ),
            updated_hashes=(
                updated_hashes
            ),
            optimized_at=utc_now(),
        )

        return (
            working,
            report,
        )

    def optimize_index(
        self,
        manager: IndexManager,
        index_id: str,
    ) -> OptimizationReport:

        chunks = manager.all_chunks(
            index_id
        )

        optimized, report = (
            self.optimize_chunks(
                chunks
            )
        )

        manager.clear(
            index_id
        )

        manager.add_chunks(
            index_id,
            optimized,
        )

        return report

    def validate_chunks(
        self,
        chunks: list[IndexChunk],
    ) -> list[str]:

        errors = []

        dimensions: int | None = None

        for chunk in chunks:

            if not chunk.chunk_id:

                errors.append(
                    "Chunk has no chunk_id"
                )

            if not chunk.document_id:

                errors.append(
                    f"Chunk {chunk.chunk_id} "
                    "has no document_id"
                )

            if not chunk.text.strip():

                errors.append(
                    f"Chunk {chunk.chunk_id} "
                    "contains empty text"
                )

            if not chunk.embedding:

                errors.append(
                    f"Chunk {chunk.chunk_id} "
                    "has no embedding"
                )

                continue

            current_dimension = len(
                chunk.embedding
            )

            if dimensions is None:

                dimensions = (
                    current_dimension
                )

            elif (
                current_dimension
                != dimensions
            ):

                errors.append(
                    f"Chunk {chunk.chunk_id} "
                    "has inconsistent embedding dimensions"
                )

        return errors