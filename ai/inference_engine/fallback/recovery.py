from __future__ import annotations

from ai.inference_engine.interfaces import InferenceBackend
from ai.inference_engine.models import (
    InferenceRequest,
    InferenceResult,
)


class FallbackRecovery:
    """Execute inference against a selected fallback backend."""

    async def recover(
        self,
        backend: InferenceBackend,
        request: InferenceRequest,
    ) -> InferenceResult:
        if not await backend.supports_model(
            request.model
        ):
            raise LookupError(
                f"Fallback backend does not support model: "
                f"{request.model}"
            )

        if not getattr(
            backend,
            "initialized",
            True,
        ):
            await backend.initialize()

        return await backend.infer(request)
