from __future__ import annotations

import asyncio

from ai.inference_engine.engine import InferenceEngine
from ai.inference_engine.interfaces import InferenceBackend
from ai.inference_engine.metrics import TelemetryCollector
from ai.inference_engine.models import (
    InferenceBackendType,
    InferenceHealth,
    InferenceRequest,
    InferenceResult,
)


class FailingBackend(InferenceBackend):
    backend_type = InferenceBackendType.TRANSFORMERS

    def __init__(self) -> None:
        self._initialized = False

    async def initialize(self) -> None:
        self._initialized = True

    async def close(self) -> None:
        self._initialized = False

    async def health_check(self) -> InferenceHealth:
        return InferenceHealth(
            healthy=True,
            backend=self.backend_type,
            message="Failing backend ready.",
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
        raise RuntimeError("Primary backend failure")


class FallbackBackend(InferenceBackend):
    backend_type = InferenceBackendType.VLLM

    def __init__(self) -> None:
        self._initialized = False

    async def initialize(self) -> None:
        self._initialized = True

    async def close(self) -> None:
        self._initialized = False

    async def health_check(self) -> InferenceHealth:
        return InferenceHealth(
            healthy=True,
            backend=self.backend_type,
            message="Fallback backend ready.",
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
            content="Fallback response",
        )


async def main() -> None:
    telemetry = TelemetryCollector()

    primary = FailingBackend()
    fallback = FallbackBackend()

    engine = InferenceEngine(
        backends=[
            primary,
            fallback,
        ],
        telemetry=telemetry,
    )

    request = InferenceRequest(
        model="mock-model",
        messages=[
            {
                "role": "user",
                "content": "Test fallback",
            }
        ],
    )

    result = await engine.infer(request)

    events = telemetry.events

    assert result.content == "Fallback response"
    assert result.backend == InferenceBackendType.VLLM

    assert len(events) == 3

    assert events[0].event_type == "inference.started"
    assert events[1].event_type == "inference.failed"
    assert events[2].event_type == "inference.completed"

    assert events[0].backend == "transformers"
    assert events[1].backend == "transformers"
    assert events[2].backend == "vllm"

    assert events[1].metadata["error_type"] == "RuntimeError"
    assert events[2].metadata["fallback"] is True

    assert events[0].request_id == request.request_id
    assert events[1].request_id == request.request_id
    assert events[2].request_id == request.request_id

    print("PRIMARY FAILURE: PASS")
    print("FAILURE TELEMETRY: PASS")
    print("FALLBACK EXECUTION: PASS")
    print("FALLBACK TELEMETRY: PASS")
    print("BACKEND TRANSITION: PASS")
    print("REQUEST ID PROPAGATION: PASS")
    print("FALLBACK TELEMETRY TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())