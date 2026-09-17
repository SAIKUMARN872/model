"""
E5 embedding data models.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class E5Config:
    """E5 model configuration."""

    model_name: str = (
        "intfloat/e5-small-v2"
    )

    dimensions: int = 384

    normalize_embeddings: bool = True

    device: str = "cpu"

    batch_size: int = 32

    max_length: int = 512

    query_prefix: str = "query: "

    passage_prefix: str = "passage: "

    model_kwargs: dict[str, Any] = field(
        default_factory=dict
    )


@dataclass
class E5Embedding:
    """Single E5 embedding result."""

    text: str

    vector: list[float]

    model: str

    dimensions: int

    input_type: str = "passage"

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "text": self.text,
            "vector": self.vector,
            "model": self.model,
            "dimensions": self.dimensions,
            "input_type": self.input_type,
            "metadata": self.metadata,
        }


@dataclass
class E5EmbeddingResponse:
    """Batch E5 embedding response."""

    embeddings: list[E5Embedding]

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