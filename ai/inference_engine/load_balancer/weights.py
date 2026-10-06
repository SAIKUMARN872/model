from __future__ import annotations

from ai.inference_engine.interfaces import InferenceBackend


class BackendWeights:
    """Store configurable selection weights for backends."""

    def __init__(
        self,
        weights: dict[str, float] | None = None,
    ) -> None:
        self._weights: dict[str, float] = {}

        for backend_type, weight in (
            weights or {}
        ).items():
            self.set_weight(
                backend_type,
                weight,
            )

    def set_weight(
        self,
        backend_type: str,
        weight: float,
    ) -> None:
        if weight < 0:
            raise ValueError(
                "Backend weight cannot be negative."
            )

        self._weights[
            backend_type.strip().lower()
        ] = weight

    def get_weight(
        self,
        backend: InferenceBackend,
    ) -> float:
        return self._weights.get(
            backend.backend_type.value,
            1.0,
        )

    def remove(
        self,
        backend_type: str,
    ) -> None:
        self._weights.pop(
            backend_type.strip().lower(),
            None,
        )

    def clear(self) -> None:
        self._weights.clear()
