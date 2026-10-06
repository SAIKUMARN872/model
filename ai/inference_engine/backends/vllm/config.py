from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class VLLMConfig:
    """Configuration for the ModelNow vLLM backend."""

    enabled: bool = True
    base_url: str = "http://localhost:8000"
    timeout_seconds: float = 60.0
    max_concurrent_requests: int = 8


__all__ = ["VLLMConfig"]
