from __future__ import annotations

from pathlib import Path
from typing import Any


def normalize_model_path(
    model_path: str | Path,
) -> str:
    """Normalize a local Microsoft Phi model path."""
    if isinstance(model_path, Path):
        value = model_path
    elif isinstance(model_path, str):
        value = Path(model_path.strip())
    else:
        raise TypeError(
            "model_path must be a string or Path"
        )

    if not str(value).strip():
        raise ValueError(
            "model_path cannot be empty"
        )

    return str(value.expanduser())


def model_path_exists(
    model_path: str | Path,
) -> bool:
    """Return whether a local model path exists."""
    return Path(
        normalize_model_path(model_path)
    ).exists()


def merge_generation_kwargs(
    defaults: dict[str, Any] | None = None,
    overrides: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Merge Phi generation settings."""
    result = dict(defaults or {})

    if overrides:
        result.update(overrides)

    return result


__all__ = [
    "normalize_model_path",
    "model_path_exists",
    "merge_generation_kwargs",
]
