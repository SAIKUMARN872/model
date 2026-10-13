from __future__ import annotations

from ai.inference_engine.models import InferenceResult


def extract_content(
    result: InferenceResult,
) -> str:
    """Extract content from an inference result."""

    return result.content


def is_finished(
    result: InferenceResult,
) -> bool:
    """Return whether a stream result has a terminal finish reason."""

    return result.finish_reason is not None


__all__ = [
    "extract_content",
    "is_finished",
]
