from __future__ import annotations

from collections.abc import Iterable

from ..base.models import ModelCapability, ModelInfo
from ..base.request import ChatRequest


def normalize_model_id(model_id: str) -> str:
    """Normalize a model ID or alias for case-insensitive matching."""

    if not isinstance(model_id, str):
        raise TypeError("model_id must be a string.")

    normalized = model_id.strip().lower()

    if not normalized:
        raise ValueError("model_id cannot be empty.")

    return normalized


def model_matches(
    model: ModelInfo,
    model_id: str,
) -> bool:
    """Return whether a model matches an ID or one of its aliases."""

    if not isinstance(model, ModelInfo):
        raise TypeError("model must be a ModelInfo instance.")

    return model.matches(normalize_model_id(model_id))


def find_model(
    models: Iterable[ModelInfo],
    model_id: str,
) -> ModelInfo | None:
    """Find a model by ID or alias."""

    normalized = normalize_model_id(model_id)

    for model in models:
        if not isinstance(model, ModelInfo):
            raise TypeError("models must contain ModelInfo instances.")

        if model.matches(normalized):
            return model

    return None


def enabled_models(
    models: Iterable[ModelInfo],
) -> list[ModelInfo]:
    """Return only enabled models."""

    return [
        model
        for model in models
        if isinstance(model, ModelInfo) and model.enabled
    ]


def models_with_capability(
    models: Iterable[ModelInfo],
    capability: ModelCapability,
) -> list[ModelInfo]:
    """Return models supporting a specific capability."""

    if not isinstance(capability, ModelCapability):
        raise TypeError(
            "capability must be a ModelCapability."
        )

    return [
        model
        for model in models
        if isinstance(model, ModelInfo)
        and model.enabled
        and model.supports(capability)
    ]


def validate_chat_request(
    request: ChatRequest,
) -> None:
    """Validate the common requirements of an MLM chat request."""

    if not isinstance(request, ChatRequest):
        raise TypeError(
            "request must be a ChatRequest instance."
        )

    if not request.model.strip():
        raise ValueError("ChatRequest.model cannot be empty.")

    if not request.messages:
        raise ValueError(
            "ChatRequest.messages cannot be empty."
        )

    if request.temperature is not None:
        if request.temperature < 0:
            raise ValueError(
                "ChatRequest.temperature cannot be negative."
            )

    if request.max_tokens is not None:
        if request.max_tokens <= 0:
            raise ValueError(
                "ChatRequest.max_tokens must be greater than zero."
            )

    if request.top_p is not None:
        if not 0 < request.top_p <= 1:
            raise ValueError(
                "ChatRequest.top_p must be between 0 and 1."
            )


def request_metadata(
    request: ChatRequest,
) -> dict[str, object]:
    """Return normalized metadata useful to provider implementations."""

    validate_chat_request(request)

    return {
        "request_id": str(request.request_id),
        "model": request.model,
        "message_count": request.message_count,
        "stream": request.stream,
        "temperature": request.temperature,
        "max_tokens": request.max_tokens,
        "top_p": request.top_p,
        "tool_count": len(request.tools),
        "has_response_format": request.response_format is not None,
    }


def capability_names(
    capabilities: Iterable[ModelCapability],
) -> tuple[str, ...]:
    """Return stable string names for model capabilities."""

    normalized = {
        capability.value
        for capability in capabilities
        if isinstance(capability, ModelCapability)
    }

    return tuple(sorted(normalized))


__all__ = [
    "normalize_model_id",
    "model_matches",
    "find_model",
    "enabled_models",
    "models_with_capability",
    "validate_chat_request",
    "request_metadata",
    "capability_names",
]
