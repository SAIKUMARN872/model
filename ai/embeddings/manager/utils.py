"""Shared validation utilities for the embedding manager."""

from collections.abc import Mapping
from typing import Any


def validate_name(name: str, field: str = "name") -> str:
    if not isinstance(name, str):
        raise TypeError(f"{field} must be a string")
    name = name.strip()
    if not name:
        raise ValueError(f"{field} must not be empty")
    return name


def validate_provider(provider: Any) -> Any:
    if provider is None:
        raise ValueError("provider must not be None")
    if not callable(getattr(provider, "embed_texts", None)):
        raise TypeError("provider must implement embed_texts(texts)")
    return provider


def validate_provider_config(config: Mapping[str, Any] | None) -> dict[str, Any]:
    if config is None:
        return {}
    if not isinstance(config, Mapping):
        raise TypeError("config must be a mapping")
    return dict(config)


def validate_texts(texts: Any) -> list[str]:
    if isinstance(texts, (str, bytes)) or not isinstance(texts, (list, tuple)):
        raise TypeError("texts must be a list or tuple of strings")
    result = []
    for index, text in enumerate(texts):
        if not isinstance(text, str):
            raise TypeError(f"texts[{index}] must be a string")
        if not text.strip():
            raise ValueError(f"texts[{index}] must not be empty")
        result.append(text.strip())
    return result
