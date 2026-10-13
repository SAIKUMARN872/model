from __future__ import annotations

from collections.abc import Mapping
from copy import deepcopy
from typing import Any


def validate_prompt_id(prompt_id: str) -> str:
    if not isinstance(prompt_id, str):
        raise TypeError("prompt_id must be a string")
    if not prompt_id.strip():
        raise ValueError("prompt_id cannot be empty")
    return prompt_id.strip()


def validate_content(content: str) -> str:
    if not isinstance(content, str):
        raise TypeError("content must be a string")
    return content


def validate_version_number(version: int) -> int:
    if isinstance(version, bool) or not isinstance(version, int):
        raise TypeError("version must be an integer")
    if version < 1:
        raise ValueError("version must be at least 1")
    return version


def validate_metadata(metadata: Mapping[str, Any] | None = None) -> dict[str, Any]:
    if metadata is None:
        return {}
    if not isinstance(metadata, Mapping):
        raise TypeError("metadata must be a mapping")
    if not all(isinstance(key, str) for key in metadata):
        raise TypeError("metadata keys must be strings")
    return deepcopy(dict(metadata))
