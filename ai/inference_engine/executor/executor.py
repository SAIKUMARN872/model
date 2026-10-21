from __future__ import annotations

from collections.abc import AsyncIterator

from ai.inference_engine.interfaces import (
    InferenceBackend,
    InferenceExecutor,
)
from ai.inference_engine.models import (
    InferenceRequest,
    InferenceResult,
)

from .dispatcher import InferenceDispatcher


class BackendExecutor(InferenceExecutor):
    """Execute inference using a selected backend."""

    def __init__(
        self,
        dispatcher: InferenceDispatcher | None = None,
    ) -> None:
        self.dispatcher = (
            dispatcher
            or InferenceDispatcher()
        )

    async def execute(
        self,
        request: InferenceRequest,
        backends: list[InferenceBackend],
    ) -> InferenceResult:
        backend = await self.dispatcher.dispatch(
            request,
            backends,
        )

        if not getattr(
            backend,
            "initialized",
            True,
        ):
            await backend.initialize()

        return await backend.infer(request)

    async def execute_stream(
        self,
        request: InferenceRequest,
        backends: list[InferenceBackend],
    ) -> AsyncIterator[InferenceResult]:
        backend = await self.dispatcher.dispatch(
            request,
            backends,
        )

        if not getattr(
            backend,
            "initialized",
            True,
        ):
            await backend.initialize()

        async for result in backend.stream(request):
            yield result


__all__ = ["BackendExecutor"]
