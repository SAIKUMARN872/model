from __future__ import annotations

from ai.inference_engine.interfaces import InferenceBackend
from ai.inference_engine.models import (
    InferenceRequest,
    InferenceResult,
)

from .recovery import FallbackRecovery
from .selector import FallbackSelector


class FallbackManager:
    """Coordinate fallback backend selection and recovery."""

    def __init__(
        self,
        selector: FallbackSelector | None = None,
        recovery: FallbackRecovery | None = None,
    ) -> None:
        self.selector = (
            selector
            or FallbackSelector()
        )
        self.recovery = (
            recovery
            or FallbackRecovery()
        )

    async def execute(
        self,
        request: InferenceRequest,
        backends: list[InferenceBackend],
        failed_backend: InferenceBackend | None = None,
    ) -> InferenceResult:
        backend = await self.selector.select(
            request=request,
            backends=backends,
            failed_backend=failed_backend,
        )

        if backend is None:
            raise LookupError(
                f"No fallback backend supports model: "
                f"{request.model}"
            )

        return await self.recovery.recover(
            backend=backend,
            request=request,
        )


__all__ = ["FallbackManager"]
