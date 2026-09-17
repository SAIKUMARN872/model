"""
BGE embedding data models.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class BGEConfig:
    """BGE model configuration."""

    model_name: str = (
        "BAAI/bge-small-en-v1.5"
    )

    dimensions: int = 384

    normalize_embeddings: bool = True

    device: str = "cpu"

    batch_size: int = 32

    max_length: int = 512

    trust_remote_code: bool = False

    model_kwargs: dict[str, Any] = field(
        default_factory=dict
    )


@dataclass
class BGEEmbedding:
    """Single BGE embedding result."""

    text: str

    vector: list[float]

    model: str

    dimensions: int

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "text": self.text,
            "vector": self.vector,
            "model": self.model,
            "dimensions": self.dimensions,
            "metadata": self.metadata,
        }


@dataclass
class BGEEmbeddingResponse:
    """BGE batch embedding response."""

    embeddings: list[BGEEmbedding]

    model: str

    dimensions: int

    usage: dict[str, int] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "embeddings": [
                item.to_dict()
                for item in self.embeddings
            ],
            "model": self.model,
            "dimensions": self.dimensions,
            "usage": self.usage,
        }