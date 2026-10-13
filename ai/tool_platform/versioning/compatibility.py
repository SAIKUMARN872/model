"""Semantic-version compatibility policies for ModelNow tools."""

from __future__ import annotations

from .versioning import parse_version


def is_compatible(version: str, target_version: str) -> bool:
    """Check compatibility using a conservative major-version policy.

    Stable versions are compatible within the same major version.
    For 0.x versions, both major and minor must match.
    """
    major, minor, _ = parse_version(version)
    target_major, target_minor, _ = parse_version(target_version)

    if major != target_major:
        return False

    if major == 0:
        return minor == target_minor

    return True


def compatible_versions(
    versions: list[str],
    target_version: str,
) -> list[str]:
    """Return compatible versions in ascending semantic-version order."""
    parse_version(target_version)
    unique_versions = set(versions)

    for version in unique_versions:
        parse_version(version)

    return sorted(
        (
            version
            for version in unique_versions
            if is_compatible(version, target_version)
        ),
        key=parse_version,
    )
