from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any

from ..base.models import ModelCapability, ModelInfo
from ..base.request import ChatRequest


def normalize_model_id(model_id: str) -> str:
    """Normalize a provider/model identifier for comparisons."""
    if not isinstance(model_id, str):
        raise TypeError("model_id must be a string")

    value = model_id.strip().lower()

    if not value:
        raise ValueError("model_id cannot be empty")

    return value


def model_matches(model: ModelInfo, model_id: str) -> bool:
    """Return whether a ModelInfo matches an ID or alias."""
    if not isinstance(model, ModelInfo):
        raise TypeError("model must be a ModelInfo")

    return model.matches(normalize_model_id(model_id))


def find_model(
    models: Iterable[ModelInfo],
    model_id: str,
) -> ModelInfo | None:
    """Find a model by canonical ID or alias."""
    normalized = normalize_model_id(model_id)

    for model in models:
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
        if model.enabled
    ]


def models_with_capability(
    models: Iterable[ModelInfo],
    capability: ModelCapability,
) -> list[ModelInfo]:
    """Filter models supporting a capability."""
    if not isinstance(capability, ModelCapability):
        raise TypeError(
            "capability must be a ModelCapability"
        )

    return [
        model
        for model in models
        if model.supports(capability)
    ]


def validate_chat_request(
    request: ChatRequest,
) -> ChatRequest:
    """Validate the normalized chat request."""
    if not isinstance(request, ChatRequest):
        raise TypeError(
            "request must be a ChatRequest"
        )

    if not isinstance(request.model, str):
        raise TypeError("request.model must be a string")

    if not request.model.strip():
        raise ValueError(
            "request.model cannot be empty"
        )

    if not request.messages:
        raise ValueError(
            "request.messages cannot be empty"
        )

    return request


def request_metadata(
    request: ChatRequest,
) -> dict[str, Any]:
    """Return a defensive copy of request metadata."""
    validate_chat_request(request)

    metadata = getattr(request, "metadata", None)

    if metadata is None:
        return {}

    if not isinstance(metadata, Mapping):
        raise TypeError(
            "request.metadata must be a mapping"
        )

    return dict(metadata)


def capability_names(
    model: ModelInfo,
) -> tuple[str, ...]:
    """Return deterministic capability names."""
    if not isinstance(model, ModelInfo):
        raise TypeError("model must be a ModelInfo")

    return tuple(
        sorted(
            capability.value
            for capability in model.capabilities
        )
    )


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
