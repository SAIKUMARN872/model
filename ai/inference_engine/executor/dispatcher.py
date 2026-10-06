from __future__ import annotations

from ai.inference_engine.interfaces import InferenceBackend
from ai.inference_engine.models import InferenceRequest


class InferenceDispatcher:
    """Dispatch inference requests to a compatible backend."""

    async def dispatch(
        self,
        request: InferenceRequest,
        backends: list[InferenceBackend],
    ) -> InferenceBackend:
        for backend in backends:
            if await backend.supports_model(
                request.model
            ):
                return backend

        raise LookupError(
            f"No backend supports model: {request.model}"
        )


__all__ = ["InferenceDispatcher"]
