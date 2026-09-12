"""
Data models for the Jina embedding provider.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class JinaConfig:
    """Configuration for a Jina embedding model."""

    model_name: str = "jinaai/jina-embeddings-v3"

    device: str = "cpu"

    batch_size: int = 32

    max_length: int = 8192

    normalize_embeddings: bool = True

    task: str | None = None

    truncate_dim: int | None = None

    trust_remote_code: bool = True

    cache_folder: str | None = None

    model_kwargs: dict[str, Any] = field(
        default_factory=dict
    )

    encode_kwargs: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:
        if self.batch_size <= 0:
            raise ValueError(
                "batch_size must be greater than zero"
            )

        if self.max_length <= 0:
            raise ValueError(
                "max_length must be greater than zero"
            )

        if (
            self.truncate_dim is not None
            and self.truncate_dim <= 0
        ):
            raise ValueError(
                "truncate_dim must be greater than zero"
            )


@dataclass
class JinaEmbedding:
    """One Jina embedding."""

    text: str

    vector: list[float]

    model_name: str

    dimensions: int

    normalized: bool = True

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "text": self.text,
            "vector": self.vector,
            "model_name": self.model_name,
            "dimensions": self.dimensions,
            "normalized": self.normalized,
            "metadata": dict(self.metadata),
        }


@dataclass
class JinaUsage:
    """Usage information for a Jina request."""

    input_count: int

    estimated_tokens: int

    dimensions: int

    model_name: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "input_count": self.input_count,
            "estimated_tokens": self.estimated_tokens,
            "dimensions": self.dimensions,
            "model_name": self.model_name,
        }


@dataclass
class JinaEmbeddingResponse:
    """Rich Jina embedding response."""

    embeddings: list[list[float]]

    model_name: str

    usage: JinaUsage

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "embeddings": self.embeddings,
            "model_name": self.model_name,
            "usage": self.usage.to_dict(),
            "metadata": dict(self.metadata),
        }