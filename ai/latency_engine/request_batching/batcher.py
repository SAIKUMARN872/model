from __future__ import annotations

from dataclasses import dataclass, field
from threading import RLock
from typing import Any

from .utils import (
    DEFAULT_MAX_BATCH_SIZE,
    DEFAULT_MAX_TOKENS,
    batch_token_count,
    can_add_to_batch,
    estimate_tokens,
    validate_batch_size,
    validate_token_limit,
)


@dataclass(frozen=True)
class BatchItem:
    request_id: str
    payload: Any
    estimated_tokens: int
    metadata: dict[str, object] = field(
        default_factory=dict
    )


@dataclass(frozen=True)
class RequestBatch:
    batch_id: str
    items: tuple[BatchItem, ...]
    total_tokens: int
    metadata: dict[str, object] = field(
        default_factory=dict
    )

    @property
    def size(self) -> int:
        return len(self.items)

    @property
    def empty(self) -> bool:
        return not self.items


class RequestBatcher:
    def __init__(
        self,
        *,
        max_batch_size: int = DEFAULT_MAX_BATCH_SIZE,
        max_tokens: int = DEFAULT_MAX_TOKENS,
    ) -> None:
        self._max_batch_size = validate_batch_size(
            max_batch_size
        )
        self._max_tokens = validate_token_limit(
            max_tokens
        )
        self._lock = RLock()
        self._items: list[BatchItem] = []
        self._counter = 0

    @property
    def max_batch_size(self) -> int:
        return self._max_batch_size

    @property
    def max_tokens(self) -> int:
        return self._max_tokens

    @property
    def size(self) -> int:
        with self._lock:
            return len(self._items)

    @property
    def total_tokens(self) -> int:
        with self._lock:
            return batch_token_count(
                [item.payload for item in self._items]
            )

    @property
    def empty(self) -> bool:
        return self.size == 0

    def can_accept(
        self,
        payload: Any,
    ) -> bool:
        item_tokens = estimate_tokens(payload)

        with self._lock:
            return can_add_to_batch(
                len(self._items),
                self.total_tokens,
                max_batch_size=self._max_batch_size,
                max_tokens=self._max_tokens,
                item_tokens=item_tokens,
            )

    def add(
        self,
        request_id: str,
        payload: Any,
        *,
        metadata: dict[str, object] | None = None,
    ) -> BatchItem:
        if not isinstance(request_id, str):
            raise TypeError(
                "request_id must be a string"
            )

        request_id = request_id.strip()

        if not request_id:
            raise ValueError(
                "request_id must not be empty"
            )

        item_tokens = estimate_tokens(payload)

        with self._lock:
            current_tokens = self.total_tokens

            if not can_add_to_batch(
                len(self._items),
                current_tokens,
                max_batch_size=self._max_batch_size,
                max_tokens=self._max_tokens,
                item_tokens=item_tokens,
            ):
                raise ValueError(
                    "request cannot be added to the current batch"
                )

            item = BatchItem(
                request_id=request_id,
                payload=payload,
                estimated_tokens=item_tokens,
                metadata=dict(metadata or {}),
            )

            self._items.append(item)
            return item

    def flush(
        self,
        *,
        batch_id: str | None = None,
        metadata: dict[str, object] | None = None,
    ) -> RequestBatch:
        with self._lock:
            self._counter += 1

            resolved_batch_id = (
                batch_id
                or f"batch-{self._counter}"
            )

            if not isinstance(
                resolved_batch_id,
                str,
            ):
                raise TypeError(
                    "batch_id must be a string"
                )

            resolved_batch_id = (
                resolved_batch_id.strip()
            )

            if not resolved_batch_id:
                raise ValueError(
                    "batch_id must not be empty"
                )

            items = tuple(self._items)

            batch = RequestBatch(
                batch_id=resolved_batch_id,
                items=items,
                total_tokens=sum(
                    item.estimated_tokens
                    for item in items
                ),
                metadata=dict(metadata or {}),
            )

            self._items.clear()

            return batch

    def clear(self) -> None:
        with self._lock:
            self._items.clear()

    def snapshot(self) -> tuple[BatchItem, ...]:
        with self._lock:
            return tuple(self._items)


Batcher = RequestBatcher


__all__ = [
    "BatchItem",
    "RequestBatch",
    "RequestBatcher",
    "Batcher",
]
