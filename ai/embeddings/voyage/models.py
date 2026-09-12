"""
Models for Voyage AI embeddings.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class VoyageConfig:
    """
    Configuration for Voyage AI embeddings.
    """

    model_name: str = "voyage-3-lite"

    api_key: str | None = None

    batch_size: int = 64

    input_type: str | None = None

    truncation: bool = True

    output_dimension: int | None = None

    output_dtype: str = "float"

    timeout: float = 60.0

    max_retries: int = 3

    base_url: str | None = None

    client_kwargs: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if self.batch_size <= 0:
            raise ValueError(
                "batch_size must be positive"
            )

        if self.timeout <= 0:
            raise ValueError(
                "timeout must be positive"
            )

        if self.max_retries < 0:
            raise ValueError(
                "max_retries cannot be negative"
            )

        if (
            self.output_dimension is not None
            and self.output_dimension <= 0
        ):
            raise ValueError(
                "output_dimension must be positive"
            )


@dataclass
class VoyageEmbedding:
    """
    Single Voyage embedding.
    """

    text: str

    vector: list[float]

    model_name: str

    dimensions: int

    input_type: str | None = None

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
            "metadata": dict(
                self.metadata
            ),
        }


@dataclass
class VoyageUsage:
    """
    Voyage request usage.
    """

    input_count: int

    total_tokens: int

    dimensions: int

    model_name: str

    input_type: str | None = None

    def to_dict(self) -> dict[str, Any]:

        return {
            "input_count": self.input_count,
            "total_tokens": self.total_tokens,
            "dimensions": self.dimensions,
            "model_name": self.model_name,
            "input_type": self.input_type,
        }


@dataclass
class VoyageEmbeddingResponse:
    """
    Rich Voyage embedding response.
    """

    embeddings: list[list[float]]

    model_name: str

    usage: VoyageUsage

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "embeddings": self.embeddings,
            "model_name": self.model_name,
            "usage": self.usage.to_dict(),
            "metadata": dict(
                self.metadata
            ),
        }