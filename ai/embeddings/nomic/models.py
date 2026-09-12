"""
Data models for the Nomic embedding provider.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class NomicConfig:
    """Configuration for a Nomic embedding model."""

    model_name: str = "nomic-ai/nomic-embed-text-v1.5"

    device: str = "cpu"

    batch_size: int = 32

    max_length: int = 8192

    normalize_embeddings: bool = True

    query_prefix: str = "search_query: "

    document_prefix: str = "search_document: "

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
                "batch_size must be positive"
            )

        if self.max_length <= 0:
            raise ValueError(
                "max_length must be positive"
            )


@dataclass
class NomicEmbedding:
    """One Nomic embedding."""

    text: str

    vector: list[float]

    model_name: str

    dimensions: int

    input_type: str = "document"

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
            "input_type": self.input_type,
            "normalized": self.normalized,
            "metadata": dict(self.metadata),
        }


@dataclass
class NomicUsage:
    """Nomic usage information."""

    input_count: int

    estimated_tokens: int

    dimensions: int

    model_name: str

    input_type: str

    def to_dict(self) -> dict[str, Any]:

        return {
            "input_count": self.input_count,
            "estimated_tokens": self.estimated_tokens,
            "dimensions": self.dimensions,
            "model_name": self.model_name,
            "input_type": self.input_type,
        }


@dataclass
class NomicEmbeddingResponse:
    """Rich Nomic response."""

    embeddings: list[list[float]]

    model_name: str

    usage: NomicUsage

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