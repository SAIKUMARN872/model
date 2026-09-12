"""
Models for the Sentence Transformers provider.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class SentenceTransformerConfig:
    """Sentence Transformers configuration."""

    model_name: str = (
        "sentence-transformers/all-MiniLM-L6-v2"
    )

    device: str = "cpu"

    batch_size: int = 32

    max_length: int = 512

    normalize_embeddings: bool = True

    show_progress_bar: bool = False

    trust_remote_code: bool = False

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
class SentenceEmbedding:
    """Single Sentence Transformer embedding."""

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