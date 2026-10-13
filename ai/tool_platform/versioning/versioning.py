"""Semantic-version utilities for ModelNow tools."""

from __future__ import annotations

from ..registry.schemas import validate_version


def parse_version(version: str) -> tuple[int, int, int]:
    """Validate and parse a strict MAJOR.MINOR.PATCH version."""
    validate_version(version)
    major, minor, patch = version.split(".")
    return int(major), int(minor), int(patch)


def compare_versions(left: str, right: str) -> int:
    """Return -1 if left is older, 0 if equal, and 1 if newer."""
    left_parts = parse_version(left)
    right_parts = parse_version(right)
    return (left_parts > right_parts) - (left_parts < right_parts)


def bump_version(version: str, part: str = "patch") -> str:
    """Increment major, minor, or patch and reset lower components."""
    major, minor, patch = parse_version(version)

    if part == "major":
        return f"{major + 1}.0.0"
    if part == "minor":
        return f"{major}.{minor + 1}.0"
    if part == "patch":
        return f"{major}.{minor}.{patch + 1}"

    raise ValueError("part must be 'major', 'minor', or 'patch'")
