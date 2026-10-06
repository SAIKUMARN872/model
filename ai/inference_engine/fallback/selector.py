from __future__ import annotations

from ai.inference_engine.interfaces import InferenceBackend
from ai.inference_engine.models import InferenceRequest


class FallbackSelector:
    """Select an alternate backend for an inference request."""

    async def select(
        self,
        request: InferenceRequest,
        backends: list[InferenceBackend],
        failed_backend: InferenceBackend | None = None,
    ) -> InferenceBackend | None:
        for backend in backends:
            if (
                failed_backend is not None
                and backend is failed_backend
            ):
                continue

            if await backend.supports_model(
                request.model
            ):
                return backend

        return None
