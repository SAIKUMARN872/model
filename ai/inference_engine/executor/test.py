from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator

from ai.inference_engine.executor import (
    BackendExecutor,
    InferenceDispatcher,
    InferencePipeline,
)
from ai.inference_engine.executor.utils import (
    backend_count,
    backend_types,
)
from ai.inference_engine.interfaces import InferenceBackend
from ai.inference_engine.models import (
    InferenceBackendType,
    InferenceHealth,
    InferenceRequest,
    InferenceResult,
)


class MockBackend(InferenceBackend):
    """Local backend used only by this test."""

    backend_type = InferenceBackendType.TRANSFORMERS

    def __init__(self) -> None:
        self.initialized = False

    async def initialize(self) -> None:
        self.initialized = True

    async def close(self) -> None:
        self.initialized = False

    async def health_check(self) -> InferenceHealth:
        return InferenceHealth(
            healthy=True,
            backend=self.backend_type,
        )

    async def supports_model(
        self,
        model: str,
    ) -> bool:
        return model == "mock-model"

    async def infer(
        self,
        request: InferenceRequest,
    ) -> InferenceResult:
        return InferenceResult(
            request_id=request.request_id,
            model=request.model,
            backend=self.backend_type,
            content="mock response",
        )

    async def stream(
        self,
        request: InferenceRequest,
    ) -> AsyncIterator[InferenceResult]:
        yield InferenceResult(
            request_id=request.request_id,
            model=request.model,
            backend=self.backend_type,
            content="mock ",
        )
        yield InferenceResult(
            request_id=request.request_id,
            model=request.model,
            backend=self.backend_type,
            content="stream",
            finish_reason="stop",
        )


async def main() -> None:
    request = InferenceRequest(
        model="mock-model",
        messages=[
            {
                "role": "user",
                "content": "Hello",
            }
        ],
    )

    backend = MockBackend()
    backends = [backend]

    dispatcher = InferenceDispatcher()

    selected = await dispatcher.dispatch(
        request,
        backends,
    )

    assert selected is backend

    print("INFERENCE DISPATCH: PASS")

    executor = BackendExecutor()

    result = await executor.execute(
        request,
        backends,
    )

    assert backend.initialized
    assert result.content == "mock response"
    assert result.model == "mock-model"

    print("BACKEND EXECUTION: PASS")

    streamed = []

    async for chunk in executor.execute_stream(
        request,
        backends,
    ):
        streamed.append(chunk.content)

    assert streamed == [
        "mock ",
        "stream",
    ]

    print("STREAM EXECUTION: PASS")

    pipeline = InferencePipeline()

    pipeline_result = await pipeline.run(
        request,
        backends,
    )

    assert pipeline_result.content == (
        "mock response"
    )

    print("PIPELINE EXECUTION: PASS")

    pipeline_stream = []

    async for chunk in pipeline.run_stream(
        request,
        backends,
    ):
        pipeline_stream.append(
            chunk.content
        )

    assert pipeline_stream == [
        "mock ",
        "stream",
    ]

    print("PIPELINE STREAMING: PASS")

    assert backend_count(backends) == 1
    assert backend_types(backends) == [
        "transformers"
    ]

    print("EXECUTOR UTILS: PASS")

    try:
        await dispatcher.dispatch(
            InferenceRequest(
                model="unsupported-model",
                messages=[
                    {
                        "role": "user",
                        "content": "test",
                    }
                ],
            ),
            backends,
        )
    except LookupError:
        pass
    else:
        raise AssertionError(
            "Unsupported model should be rejected."
        )

    print("DISPATCH VALIDATION: PASS")
    print("EXECUTOR TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())
