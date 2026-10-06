from __future__ import annotations

from ai.inference_engine.interfaces import InferenceBackend
from ai.inference_engine.models import InferenceRequest

from .health import BackendHealthTracker
from .weights import BackendWeights


class LoadBalancer:
    """Select an eligible backend for an inference request."""

    def __init__(
        self,
        health: BackendHealthTracker | None = None,
        weights: BackendWeights | None = None,
    ) -> None:
        self.health = (
            health
            or BackendHealthTracker()
        )
        self.weights = (
            weights
            or BackendWeights()
        )

    async def select(
        self,
        request: InferenceRequest,
        backends: list[InferenceBackend],
    ) -> InferenceBackend:
        candidates: list[InferenceBackend] = []

        for backend in backends:
            if not self.health.is_healthy(
                backend
            ):
                continue

            if await backend.supports_model(
                request.model
            ):
                candidates.append(backend)

        if not candidates:
            raise LookupError(
                f"No healthy backend supports model: "
                f"{request.model}"
            )

        return max(
            candidates,
            key=self.weights.get_weight,
        )
