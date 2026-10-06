from __future__ import annotations

from typing import Any

from ...base.models import ModelInfo
from .models import TINYLLAMA_MODELS


def get_model(model_id: str) -> ModelInfo | None:
    normalized = model_id.strip().lower()

    for model in TINYLLAMA_MODELS:
        if model.matches(normalized):
            return model

    return None


def is_supported_model(model_id: str) -> bool:
    return get_model(model_id) is not None


def normalize_model_id(model_id: str | None) -> str:
    if not model_id:
        return TINYLLAMA_MODELS[0].id

    model = get_model(model_id)

    if model is None:
        raise ValueError(
            f"Unsupported TinyLlama model: {model_id}"
        )

    return model.id


def build_generation_kwargs(
    *,
    max_new_tokens: int,
    temperature: float | None = None,
    top_p: float | None = None,
) -> dict[str, Any]:
    kwargs: dict[str, Any] = {
        "max_new_tokens": max_new_tokens,
    }

    if temperature is not None:
        kwargs["temperature"] = temperature
        kwargs["do_sample"] = temperature > 0

    if top_p is not None:
        kwargs["top_p"] = top_p

    return kwargs


__all__ = [
    "build_generation_kwargs",
    "get_model",
    "is_supported_model",
    "normalize_model_id",
]
