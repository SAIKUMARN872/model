from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class ModelAttributes:
    """
    Extended descriptive metadata for a canonical ModelRecord.
    """

    organization: str | None = None
    family: str | None = None
    release_date: str | None = None
    deprecation_date: str | None = None

    parameter_count: int | None = None

    open_weights: bool | None = None
    commercial_use: bool | None = None

    input_modalities: tuple[str, ...] = ()
    output_modalities: tuple[str, ...] = ()

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


__all__ = ["ModelAttributes"]
