"""
Models for the OpenAI embedding provider.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class OpenAIEmbeddingConfig:
    """OpenAI embedding configuration."""

    model_name: str = "text-embedding-3-small"

    api_key: str | None = None

    base_url: str | None = None

    dimensions: int | None = None

    encoding_format: str = "float"

    batch_size: int = 64

    timeout: float = 60.0

    max_retries: int = 3

    organization: str | None = None

    user: str | None = None

    normalize_embeddings: bool = True

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
            self.dimensions is not None
            and self.dimensions <= 0
        ):
            raise ValueError(
                "dimensions must be positive"
            )


@dataclass
class OpenAIEmbeddingResponse:
    """OpenAI embedding response."""

    embeddings: list[list[float]]

    model: str

    dimensions: int

    input_count: int

    usage_tokens: int = 0

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "embeddings": self.embeddings,
            "model": self.model,
            "dimensions": self.dimensions,
            "input_count": self.input_count,
            "usage_tokens": self.usage_tokens,
            "metadata": dict(self.metadata),
        }