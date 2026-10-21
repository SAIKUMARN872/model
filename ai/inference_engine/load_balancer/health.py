from __future__ import annotations

from ai.inference_engine.interfaces import InferenceBackend


class BackendHealthTracker:
    """Track backend health state for load balancing."""

    def __init__(self) -> None:
        self._healthy: dict[str, bool] = {}

    def _key(
        self,
        backend: InferenceBackend,
    ) -> str:
        return backend.backend_type.value

    def set_health(
        self,
        backend: InferenceBackend,
        healthy: bool,
    ) -> None:
        self._healthy[self._key(backend)] = healthy

    def is_healthy(
        self,
        backend: InferenceBackend,
    ) -> bool:
        return self._healthy.get(
            self._key(backend),
            True,
        )

    def remove(
        self,
        backend: InferenceBackend,
    ) -> None:
        self._healthy.pop(
            self._key(backend),
            None,
        )

    def clear(self) -> None:
        self._healthy.clear()
