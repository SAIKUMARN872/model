from __future__ import annotations

import asyncio

from ai.inference_engine.interfaces import InferenceBackend
from ai.inference_engine.load_balancer import (
    BackendHealthTracker,
    BackendWeights,
    LoadBalancer,
)
from ai.inference_engine.models import (
    InferenceBackendType,
    InferenceHealth,
    InferenceRequest,
    InferenceResult,
)


class MockBackend(InferenceBackend):
    def __init__(
        self,
        backend_type: InferenceBackendType,
    ) -> None:
        self._backend_type = backend_type

    @property
    def backend_type(
        self,
    ) -> InferenceBackendType:
        return self._backend_type

    async def initialize(self) -> None:
        pass

    async def close(self) -> None:
        pass

    async def health_check(
        self,
    ) -> InferenceHealth:
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
            content=self.backend_type.value,
        )


async def main() -> None:
    transformers = MockBackend(
        InferenceBackendType.TRANSFORMERS
    )

    vllm = MockBackend(
        InferenceBackendType.VLLM
    )

    health = BackendHealthTracker()

    weights = BackendWeights(
        {
            "transformers": 1.0,
            "vllm": 3.0,
        }
    )

    balancer = LoadBalancer(
        health=health,
        weights=weights,
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

    selected = await balancer.select(
        request=request,
        backends=[
            transformers,
            vllm,
        ],
    )

    assert selected is vllm

    print("BACKEND DISCOVERY: PASS")
    print("WEIGHTED SELECTION: PASS")

    health.set_health(
        vllm,
        False,
    )

    selected = await balancer.select(
        request=request,
        backends=[
            transformers,
            vllm,
        ],
    )

    assert selected is transformers

    print("HEALTH FILTERING: PASS")

    health.set_health(
        transformers,
        False,
    )

    try:
        await balancer.select(
            request=request,
            backends=[
                transformers,
                vllm,
            ],
        )
    except LookupError:
        pass
    else:
        raise AssertionError(
            "Expected LookupError when all backends are unhealthy."
        )

    print("NO HEALTHY BACKEND: PASS")
    print("LOAD BALANCER TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())
