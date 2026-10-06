from __future__ import annotations


class InferenceEngineError(Exception):
    """Base exception for inference engine errors."""


class InferenceValidationError(
    InferenceEngineError
):
    """Raised when an inference request is invalid."""


class BackendNotFoundError(
    InferenceEngineError
):
    """Raised when no compatible backend is available."""


class InferenceExecutionError(
    InferenceEngineError
):
    """Raised when inference execution fails."""


__all__ = [
    "InferenceEngineError",
    "InferenceValidationError",
    "BackendNotFoundError",
    "InferenceExecutionError",
]
