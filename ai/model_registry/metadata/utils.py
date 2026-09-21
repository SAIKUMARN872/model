from __future__ import annotations

from collections.abc import Iterable

from ..models import ModelRecord
from .metadata import ModelMetadata


def metadata_key(
    model: ModelRecord | str,
) -> str:
    """
    Return the canonical metadata key.
    """

    if isinstance(model, ModelRecord):
        return model.qualified_id.lower()

    if isinstance(model, str):
        return model.strip().lower()

    raise TypeError(
        "model must be a ModelRecord or qualified ID string"
    )


def filter_by_tag(
    metadata: Iterable[ModelMetadata],
    tag: str,
) -> list[ModelMetadata]:
    """
    Return metadata entries containing a specific tag.
    """

    value = tag.strip().lower()

    return [
        item
        for item in metadata
        if item.has_tag(value)
    ]


def filter_by_organization(
    metadata: Iterable[ModelMetadata],
    organization: str,
) -> list[ModelMetadata]:
    """
    Return metadata entries belonging to an organization.
    """

    value = organization.strip().lower()

    return [
        item
        for item in metadata
        if (
            item.attributes.organization
            and item.attributes.organization.strip().lower()
            == value
        )
    ]


def merge_metadata(
    base: ModelMetadata,
    override: ModelMetadata,
) -> ModelMetadata:
    """
    Merge metadata while preserving the canonical model ID.

    Fields supplied by override replace corresponding base fields.
    """

    if base.qualified_id.lower() != (
        override.qualified_id.lower()
    ):
        raise ValueError(
            "Cannot merge metadata for different models"
        )

    return ModelMetadata(
        qualified_id=base.qualified_id,
        attributes=override.attributes,
        tags=override.tags or base.tags,
        description=(
            override.description
            if override.description is not None
            else base.description
        ),
        documentation_url=(
            override.documentation_url
            if override.documentation_url is not None
            else base.documentation_url
        ),
        license=(
            override.license
            if override.license is not None
            else base.license
        ),
        metadata={
            **base.metadata,
            **override.metadata,
        },
    )


__all__ = [
    "metadata_key",
    "filter_by_tag",
    "filter_by_organization",
    "merge_metadata",
]
