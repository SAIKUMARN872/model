from __future__ import annotations

from collections.abc import Iterable

from .versions import ModelVersion


def normalize_version(version: str) -> str:
    if not isinstance(version, str):
        raise TypeError(
            "version must be a string"
        )

    value = version.strip()

    if not value:
        raise ValueError(
            "version cannot be empty"
        )

    return value


def sort_versions(
    versions: Iterable[ModelVersion],
) -> list[ModelVersion]:
    """
    Sort model versions deterministically.

    Numeric dotted versions are ordered numerically where possible.
    Other version strings fall back to case-insensitive ordering.
    """

    values = list(versions)

    def version_key(
        item: ModelVersion,
    ) -> tuple:
        normalized = normalize_version(
            item.version
        )

        parts = normalized.split(".")

        if all(
            part.isdigit()
            for part in parts
        ):
            return (
                0,
                tuple(
                    int(part)
                    for part in parts
                ),
            )

        return (
            1,
            normalized.lower(),
        )

    return sorted(
        values,
        key=version_key,
    )


def latest_version(
    versions: Iterable[ModelVersion],
) -> ModelVersion | None:
    values = list(versions)

    if not values:
        return None

    return sort_versions(values)[-1]


def active_versions(
    versions: Iterable[ModelVersion],
) -> list[ModelVersion]:
    return [
        version
        for version in versions
        if version.active
    ]


def version_exists(
    versions: Iterable[ModelVersion],
    version: str,
) -> bool:
    value = normalize_version(version).lower()

    return any(
        item.version.strip().lower() == value
        for item in versions
    )


__all__ = [
    "normalize_version",
    "sort_versions",
    "latest_version",
    "active_versions",
    "version_exists",
]
