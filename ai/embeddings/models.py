from dataclasses import dataclass
from typing import Sequence

@dataclass(frozen=True)
class EmbeddingRequest:
    texts: Sequence[str]
    normalize: bool = True

@dataclass(frozen=True)
class EmbeddingResult:
    embeddings: list[list[float]]
    model: str
    dimension: int
    count: int

@dataclass(frozen=True)
class EmbeddingModelInfo:
    name: str
    provider: str
    dimension: int | None = None
