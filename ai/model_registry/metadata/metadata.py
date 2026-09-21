from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ..models import ModelRecord
from .attributes import ModelAttributes
from .tags import normalize_tags


@dataclass(frozen=True)
class ModelMetadata:
    """
    ModelNow metadata envelope.

    ModelRecord remains the canonical registry identity.
    ModelMetadata stores additional descriptive information
    used by discovery, routing, UI, governance, and analytics.
    """

    qualified_id: str

    attributes: ModelAttributes = field(
        default_factory=ModelAttributes
    )

    tags: tuple[str, ...] = ()

    description: str | None = None
    documentation_url: str | None = None
    license: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    @classmethod
    def from_model(
        cls,
        model: ModelRecord,
        *,
        attributes: ModelAttributes | None = None,
        tags: tuple[str, ...] = (),
        description: str | None = None,
        documentation_url: str | None = None,
        license: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> "ModelMetadata":
        if not isinstance(model, ModelRecord):
            raise TypeError(
                "model must be a ModelRecord"
            )

        return cls(
            qualified_id=model.qualified_id,
            attributes=attributes or ModelAttributes(),
            tags=normalize_tags(tags),
            description=description,
            documentation_url=documentation_url,
            license=license,
            metadata=dict(metadata or {}),
        )

    def has_tag(self, tag: str) -> bool:
        value = tag.strip().lower()

        return value in self.tags

    def with_tags(
        self,
        tags: tuple[str, ...],
    ) -> "ModelMetadata":
        return ModelMetadata(
            qualified_id=self.qualified_id,
            attributes=self.attributes,
            tags=normalize_tags(tags),
            description=self.description,
            documentation_url=self.documentation_url,
            license=self.license,
            metadata=self.metadata,
        )


class MetadataStore:
    """
    In-memory metadata store keyed by canonical qualified model ID.
    """

    def __init__(
        self,
        metadata: list[ModelMetadata] | None = None,
    ) -> None:
        self._items: dict[str, ModelMetadata] = {}

        for item in metadata or []:
            self.upsert(item)

    def register(
        self,
        metadata: ModelMetadata,
    ) -> ModelMetadata:
        if not isinstance(metadata, ModelMetadata):
            raise TypeError(
                "metadata must be ModelMetadata"
            )

        key = metadata.qualified_id.lower()

        if key in self._items:
            raise ValueError(
                f"Metadata already exists: "
                f"{metadata.qualified_id}"
            )

        self._items[key] = metadata

        return metadata

    def upsert(
        self,
        metadata: ModelMetadata,
    ) -> ModelMetadata:
        if not isinstance(metadata, ModelMetadata):
            raise TypeError(
                "metadata must be ModelMetadata"
            )

        self._items[
            metadata.qualified_id.lower()
        ] = metadata

        return metadata

    def get(
        self,
        qualified_id: str,
    ) -> ModelMetadata | None:
        return self._items.get(
            qualified_id.strip().lower()
        )

    def list_all(self) -> list[ModelMetadata]:
        return list(self._items.values())

    def remove(
        self,
        qualified_id: str,
    ) -> ModelMetadata | None:
        return self._items.pop(
            qualified_id.strip().lower(),
            None,
        )

    def clear(self) -> None:
        self._items.clear()

    def count(self) -> int:
        return len(self._items)


__all__ = [
    "ModelMetadata",
    "MetadataStore",
]
