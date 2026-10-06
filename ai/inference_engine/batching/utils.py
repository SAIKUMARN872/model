from __future__ import annotations

from ai.inference_engine.models import InferenceRequest


def same_model(
    requests: list[InferenceRequest],
) -> bool:
    """Return whether all requests target the same model."""

    if not requests:
        return True

    model = requests[0].model

    return all(
        request.model == model
        for request in requests
    )


def batch_size(
    requests: list[InferenceRequest],
) -> int:
    """Return the number of requests in a batch."""

    return len(requests)


__all__ = [
    "same_model",
    "batch_size",
]
