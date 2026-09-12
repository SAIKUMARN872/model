"""
Core embedding data models.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass
class EmbeddingVector:
    """
    Represents one embedding vector.
    """

    vector: list[float]

    model: str

    provider: str

    dimensions: int

    text: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    created_at: datetime = field(
        default_factory=lambda:
        datetime.now(timezone.utc)
    )

    def __post_init__(self) -> None:

        if self.dimensions != len(
            self.vector
        ):

            raise ValueError(
                "Embedding dimension mismatch"
            )

    def to_list(self) -> list[float]:

        return list(
            self.vector
        )

    def to_dict(self) -> dict[str, Any]:

        return {
            "vector": self.vector,
            "model": self.model,
            "provider": self.provider,
            "dimensions": self.dimensions,
            "text": self.text,
            "metadata": dict(
                self.metadata
            ),
            "created_at": (
                self.created_at.isoformat()
            ),
        }


@dataclass
class EmbeddingBatch:
    """
    Collection of embedding vectors.
    """

    embeddings: list[list[float]]

    model: str

    provider: str

    dimensions: int

    texts: list[str] = field(
        default_factory=list
    )

    usage_tokens: int = 0

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if len(self.embeddings) != len(
            self.texts
        ) and self.texts:

            raise ValueError(
                "Embedding/text count mismatch"
            )

        for vector in self.embeddings:

            if len(vector) != self.dimensions:

                raise ValueError(
                    "Embedding dimension mismatch"
                )

    @property
    def count(self) -> int:
        return len(
            self.embeddings
        )

    def to_dict(self) -> dict[str, Any]:

        return {
            "embeddings": self.embeddings,
            "model": self.model,
            "provider": self.provider,
            "dimensions": self.dimensions,
            "texts": self.texts,
            "usage_tokens": self.usage_tokens,
            "metadata": dict(
                self.metadata
            ),
        }


@dataclass
class EmbeddingConfig:
    """
    Generic embedding engine configuration.
    """

    provider: str

    model: str | None = None

    batch_size: int = 32

    normalize: bool = True

    dimensions: int | None = None

    metric: str = "cosine"

    provider_config: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if not self.provider.strip():

            raise ValueError(
                "provider cannot be empty"
            )

        if self.batch_size <= 0:

            raise ValueError(
                "batch_size must be positive"
            )

        if (
            self.dimensions is not None
            and self.dimensions <= 0
        ):

            raise ValueError(
                "dimensions must be positive"
            )