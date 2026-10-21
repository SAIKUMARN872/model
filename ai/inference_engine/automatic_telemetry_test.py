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


class MockBackend(InferenceBackend):
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
            message="Mock backend ready.",
        )

    async def supports_model(self, model: str) -> bool:
        return model == "mock-model"

    async def infer(
        self,
        request: InferenceRequest,
    ) -> InferenceResult:
        return InferenceResult(
            request_id=request.request_id,
            model=request.model,
            backend=self.backend_type,
            content="Automatic telemetry response",
        )


async def main() -> None:
    telemetry = TelemetryCollector()
    backend = MockBackend()

    engine = InferenceEngine(
        backends=[backend],
        telemetry=telemetry,
    )

    request = InferenceRequest(
        model="mock-model",
        messages=[
            {
                "role": "user",
                "content": "Hello",
            }
        ],
    )

    result = await engine.infer(request)

    events = telemetry.events

    assert result.content == "Automatic telemetry response"
    assert len(events) == 2

    assert events[0].event_type == "inference.started"
    assert events[1].event_type == "inference.completed"

    assert events[0].request_id == request.request_id
    assert events[1].request_id == request.request_id

    assert events[0].model == "mock-model"
    assert events[1].model == "mock-model"

    assert events[0].backend == "transformers"
    assert events[1].backend == "transformers"

    assert events[1].metadata["status"] == "completed"
    assert events[1].metadata["fallback"] is False if "fallback" in events[1].metadata else True

    print("AUTOMATIC TELEMETRY: PASS")
    print("START EVENT: PASS")
    print("COMPLETED EVENT: PASS")
    print("REQUEST ID: PASS")
    print("MODEL: PASS")
    print("BACKEND: PASS")
    print("TELEMETRY LIFECYCLE: PASS")


if __name__ == "__main__":
    asyncio.run(main())