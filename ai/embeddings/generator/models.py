"""Data models for embedding generation."""

from dataclasses import dataclass, field
from typing import Any, Mapping


@dataclass(frozen=True)
class GenerationConfig:
    """Configuration for batched embedding generation."""

    batch_size: int = 32
    normalize: bool = True
    model_name: str | None = None
    namespace: str = "modelnow"

    def __post_init__(self) -> None:
        if isinstance(self.batch_size, bool) or not isinstance(self.batch_size, int):
            raise TypeError("batch_size must be an integer")
        if not 1 <= self.batch_size <= 512:
            raise ValueError("batch_size must be between 1 and 512")
        if not isinstance(self.normalize, bool):
            raise TypeError("normalize must be a boolean")
        if self.model_name is not None and (
            not isinstance(self.model_name, str) or not self.model_name.strip()
        ):
            raise ValueError("model_name must be a non-empty string or None")
        if not isinstance(self.namespace, str) or not self.namespace.strip():
            raise ValueError("namespace must be a non-empty string")


@dataclass
class GeneratedEmbedding:
    """An embedding vector and its associated source information."""

    text: str
    vector: list[float]
    index: int
    model_name: str
    namespace: str = "modelnow"
    metadata: Mapping[str, Any] | None = field(default=None)
