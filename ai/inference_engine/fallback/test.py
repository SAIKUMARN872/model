from __future__ import annotations

import asyncio

from ai.inference_engine.fallback import (
    FallbackManager,
)
from ai.inference_engine.interfaces import (
    InferenceBackend,
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
        name: str,
        should_fail: bool = False,
    ) -> None:
        self.name = name
        self.should_fail = should_fail
        self._initialized = False
        self.infer_called = False

    @property
    def backend_type(
        self,
    ) -> InferenceBackendType:
        return InferenceBackendType.TRANSFORMERS

    @property
    def initialized(self) -> bool:
        return self._initialized

    async def initialize(self) -> None:
        self._initialized = True

    async def close(self) -> None:
        self._initialized = False

    async def health_check(
        self,
    ) -> InferenceHealth:
        return InferenceHealth(
            healthy=not self.should_fail,
            backend=self.backend_type,
            message=self.name,
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
        self.infer_called = True

        if self.should_fail:
            raise RuntimeError(
                f"{self.name} failed"
            )

        return InferenceResult(
            request_id=request.request_id,
            model=request.model,
            backend=self.backend_type,
            content=f"response from {self.name}",
        )


async def main() -> None:
    primary = MockBackend(
        name="primary",
        should_fail=True,
    )

    fallback = MockBackend(
        name="fallback",
        should_fail=False,
    )

    manager = FallbackManager()

    request = InferenceRequest(
        model="mock-model",
        messages=[
            {
                "role": "user",
                "content": "Hello",
            }
        ],
    )

    await primary.initialize()
    await fallback.initialize()

    result = await manager.execute(
        request=request,
        backends=[
            primary,
            fallback,
        ],
        failed_backend=primary,
    )

    assert fallback.infer_called
    assert result.content == (
        "response from fallback"
    )

    assert not primary.infer_called

    print("FALLBACK SELECTION: PASS")
    print("FAILED BACKEND EXCLUSION: PASS")
    print("FALLBACK RECOVERY: PASS")
    print("FALLBACK RESULT: PASS")
    print("FALLBACK TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())
