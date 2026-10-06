from __future__ import annotations

import inspect
from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable

from .batcher import BatchItem, RequestBatch


BatchHandler = Callable[
    [RequestBatch],
    Any,
]


@dataclass(frozen=True)
class DispatchResult:
    batch_id: str
    results: dict[str, Any]
    succeeded: int
    failed: int
    metadata: dict[str, object] = field(
        default_factory=dict
    )

    @property
    def total(self) -> int:
        return self.succeeded + self.failed


class BatchDispatchError(RuntimeError):
    pass


class BatchDispatcher:
    def __init__(
        self,
        handler: BatchHandler | None = None,
    ) -> None:
        self._handler = handler

    @property
    def handler(self) -> BatchHandler | None:
        return self._handler

    def set_handler(
        self,
        handler: BatchHandler,
    ) -> None:
        if not callable(handler):
            raise TypeError(
                "handler must be callable"
            )

        self._handler = handler

    def clear_handler(self) -> None:
        self._handler = None

    async def dispatch(
        self,
        batch: RequestBatch,
    ) -> DispatchResult:
        if not isinstance(
            batch,
            RequestBatch,
        ):
            raise TypeError(
                "batch must be a RequestBatch"
            )

        if self._handler is None:
            raise BatchDispatchError(
                "no batch handler configured"
            )

        try:
            response = self._handler(batch)

            if inspect.isawaitable(response):
                response = await response

            results = self._normalize_results(
                batch,
                response,
            )

            succeeded = sum(
                1
                for item in batch.items
                if item.request_id in results
                and not isinstance(
                    results[item.request_id],
                    Exception,
                )
            )

            failed = batch.size - succeeded

            return DispatchResult(
                batch_id=batch.batch_id,
                results=results,
                succeeded=succeeded,
                failed=failed,
            )

        except Exception as exc:
            raise BatchDispatchError(
                f"batch dispatch failed: {exc}"
            ) from exc

    def _normalize_results(
        self,
        batch: RequestBatch,
        response: Any,
    ) -> dict[str, Any]:
        if isinstance(response, dict):
            return {
                str(key): value
                for key, value in response.items()
            }

        if isinstance(response, (list, tuple)):
            if len(response) != batch.size:
                raise ValueError(
                    "handler result count must match "
                    "batch size"
                )

            return {
                item.request_id: result
                for item, result in zip(
                    batch.items,
                    response,
                )
            }

        if batch.size == 1:
            return {
                batch.items[0].request_id: response
            }

        raise ValueError(
            "handler must return a mapping or "
            "one result per batch item"
        )

    @staticmethod
    def split_results(
        batch: RequestBatch,
        results: dict[str, Any],
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        successful: dict[str, Any] = {}
        failed: dict[str, Any] = {}

        for item in batch.items:
            if item.request_id not in results:
                failed[item.request_id] = BatchDispatchError(
                    "missing result"
                )
                continue

            result = results[item.request_id]

            if isinstance(result, Exception):
                failed[item.request_id] = result
            else:
                successful[item.request_id] = result

        return successful, failed


__all__ = [
    "BatchHandler",
    "BatchDispatchError",
    "BatchDispatcher",
    "DispatchResult",
]
