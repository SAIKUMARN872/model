from __future__ import annotations

from collections.abc import AsyncIterator

from ai.inference_engine.models import InferenceResult

from .buffer import StreamBuffer


class InferenceStream:
    """Consume inference results and accumulate streamed content."""

    def __init__(
        self,
        results: AsyncIterator[InferenceResult],
    ) -> None:
        self._results = results
        self._buffer = StreamBuffer()

    @property
    def buffer(self) -> StreamBuffer:
        return self._buffer

    async def __aiter__(
        self,
    ) -> AsyncIterator[InferenceResult]:
        async for result in self._results:
            self._buffer.append(result.content)
            yield result

    async def collect(self) -> str:
        async for _ in self:
            pass

        return self._buffer.get_content()


__all__ = ["InferenceStream"]
