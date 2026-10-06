from __future__ import annotations

from ai.inference_engine.interfaces import InferenceBackend


def backend_count(
    backends: list[InferenceBackend],
) -> int:
    """Return the number of available backends."""

    return len(backends)


def backend_types(
    backends: list[InferenceBackend],
) -> list[str]:
    """Return backend type identifiers."""

    return [
        backend.backend_type.value
        for backend in backends
    ]


__all__ = [
    "backend_count",
    "backend_types",
]
