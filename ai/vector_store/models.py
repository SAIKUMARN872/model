"""Core data models for the ModelNow vector store."""

from dataclasses import dataclass, field
from typing import Any


MetadataValue = str | int | float | bool


@dataclass(frozen=True)
class VectorDocument:
    """A document and its optional embedding stored in a vector database."""

    document_id: str
    text: str
    metadata: dict[str, MetadataValue] = field(default_factory=dict)
    embedding: list[float] | None = None

    def __post_init__(self) -> None:
        if not isinstance(self.document_id, str) or not self.document_id.strip():
            raise ValueError("document_id must be a non-empty string")

        if not isinstance(self.text, str) or not self.text.strip():
            raise ValueError("text must be a non-empty string")

        if not isinstance(self.metadata, dict):
            raise TypeError("metadata must be a dictionary")

        for key, value in self.metadata.items():
            if not isinstance(key, str) or not key.strip():
                raise ValueError("Metadata keys must be non-empty strings")

            if isinstance(value, (dict, list, tuple, set)) or value is None:
                raise TypeError(
                    f"Metadata value for {key!r} must be a string, integer, "
                    "float, or boolean"
                )

            if not isinstance(value, (str, int, float, bool)):
                raise TypeError(f"Unsupported metadata value for {key!r}")

        if self.embedding is not None:
            if not self.embedding:
                raise ValueError("embedding cannot be empty")

            if any(
                not isinstance(value, (int, float)) or isinstance(value, bool)
                for value in self.embedding
            ):
                raise TypeError("Embedding values must be numeric")

            object.__setattr__(
                self, "embedding", [float(value) for value in self.embedding]
            )


@dataclass(frozen=True)
class VectorSearchResult:
    """A document returned by vector similarity search."""

    document: VectorDocument
    distance: float
    score: float | None = None


@dataclass(frozen=True)
class VectorCollectionInfo:
    """Basic information about a vector collection."""

    name: str
    count: int
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise ValueError("Collection name must not be empty")

        if self.count < 0:
            raise ValueError("Collection count cannot be negative")
