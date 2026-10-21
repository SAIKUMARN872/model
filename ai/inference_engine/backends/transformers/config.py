from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class TransformersConfig:
    """Configuration for the ModelNow Transformers backend."""

    enabled: bool = True
    device: str = "auto"
    max_concurrent_requests: int = 1
