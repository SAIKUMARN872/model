from __future__ import annotations

from collections.abc import AsyncIterator

from ai.inference_engine.interfaces import InferenceBackend
from ai.inference_engine.models import (
    InferenceRequest,
    InferenceResult,
)

from .executor import BackendExecutor


class InferencePipeline:
    """Run inference through the execution pipeline."""

    def __init__(
        self,
        executor: BackendExecutor | None = None,
    ) -> None:
        self.executor = (
            executor
            or BackendExecutor()
        )

    async def run(
        self,
        request: InferenceRequest,
        backends: list[InferenceBackend],
    ) -> InferenceResult:
        return await self.executor.execute(
            request,
            backends,
        )

    async def run_stream(
        self,
        request: InferenceRequest,
        backends: list[InferenceBackend],
    ) -> AsyncIterator[InferenceResult]:
        async for result in self.executor.execute_stream(
            request,
            backends,
        ):
            yield result


__all__ = ["InferencePipeline"]
