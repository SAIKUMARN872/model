from __future__ import annotations

import asyncio

from ai.inference_engine.engine import InferenceEngine
from ai.inference_engine.metrics import MetricsRegistry
from ai.inference_engine.models import (
    InferenceBackendType,
    InferenceHealth,
    InferenceRequest,
    InferenceResult,
    InferenceUsage,
)
from ai.inference_engine.interfaces import InferenceBackend


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
            content="Mock response",
            usage=InferenceUsage(
                input_tokens=10,
                output_tokens=5,
                total_tokens=15,
                estimated_cost=0.25,
            ),
            latency_ms=12.5,
            time_to_first_token_ms=4.5,
        )


async def main() -> None:
    metrics = MetricsRegistry()
    backend = MockBackend()

    engine = InferenceEngine(
        backends=[backend],
        metrics=metrics,
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

    overall = metrics.overall
    backend_metrics = metrics.by_backend["transformers"]
    model_metrics = metrics.by_model["mock-model"]

    assert result.content == "Mock response"
    assert overall.request_count == 1
    assert overall.success_count == 1
    assert overall.failure_count == 0

    assert overall.input_tokens == 10
    assert overall.output_tokens == 5
    assert overall.total_tokens == 15

    assert overall.estimated_cost == 0.25
    assert overall.latency_ms_samples == 1
    assert overall.ttft_ms_samples == 1

    assert backend_metrics.request_count == 1
    assert backend_metrics.success_count == 1

    assert model_metrics.request_count == 1
    assert model_metrics.success_count == 1

    print("ENGINE METRICS RECORDING: PASS")
    print("TOKEN METRICS: PASS")
    print("COST METRICS: PASS")
    print("LATENCY METRICS: PASS")
    print("BACKEND METRICS: PASS")
    print("MODEL METRICS: PASS")
    print("INFERENCE METRICS INTEGRATION TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())