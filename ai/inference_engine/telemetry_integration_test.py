from __future__ import annotations

import asyncio

from ai.inference_engine.engine import InferenceEngine
from ai.inference_engine.interfaces import InferenceBackend
from ai.inference_engine.metrics import (
    InferenceTelemetryEvent,
    TelemetryCollector,
)
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
            content="Telemetry response",
        )


async def main() -> None:
    collector = TelemetryCollector()
    backend = MockBackend()

    engine = InferenceEngine(
        backends=[backend],
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

    event = InferenceTelemetryEvent(
        event_type="inference.completed",
        request_id=result.request_id,
        model=result.model,
        backend=result.backend.value,
        metadata={
            "content_length": len(result.content),
        },
    )

    collector.record(event)

    assert result.content == "Telemetry response"
    assert len(collector.events) == 1

    recorded = collector.events[0]

    assert recorded.event_type == "inference.completed"
    assert recorded.request_id == request.request_id
    assert recorded.model == "mock-model"
    assert recorded.backend == "transformers"
    assert recorded.metadata["content_length"] > 0

    print("ENGINE EXECUTION: PASS")
    print("TELEMETRY EVENT: PASS")
    print("REQUEST ID PROPAGATION: PASS")
    print("MODEL PROPAGATION: PASS")
    print("BACKEND PROPAGATION: PASS")
    print("TELEMETRY METADATA: PASS")
    print("TELEMETRY INTEGRATION TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())