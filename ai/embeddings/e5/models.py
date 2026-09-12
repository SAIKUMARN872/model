"""
Data models for the E5 embedding provider.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class E5Config:
    """
    Configuration for an E5 embedding model.
    """

    model_name: str = "intfloat/e5-base-v2"

    device: str = "cpu"

    normalize_embeddings: bool = True

    batch_size: int = 32

    max_length: int = 512

    query_prefix: str = "query: "

    passage_prefix: str = "passage: "

    trust_remote_code: bool = False

    show_progress_bar: bool = False

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


@dataclass
class E5Embedding:
    """
    Represents a single E5 embedding.
    """

    text: str

    vector: list[float]

    model_name: str

    dimensions: int

    input_type: str = "passage"

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
class E5Usage:
    """
    Usage information for an E5 embedding operation.
    """

    input_count: int = 0

    estimated_tokens: int = 0

    dimensions: int = 0

    model_name: str = ""

    input_type: str = "passage"

    def to_dict(self) -> dict[str, Any]:
        return {
            "input_count": self.input_count,
            "estimated_tokens": self.estimated_tokens,
            "dimensions": self.dimensions,
            "model_name": self.model_name,
            "input_type": self.input_type,
        }


@dataclass
class E5EmbeddingResponse:
    """
    Rich response returned by the E5 provider.
    """

    embeddings: list[list[float]]

    model_name: str

    usage: E5Usage

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