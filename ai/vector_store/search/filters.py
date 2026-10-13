"""Metadata filter validation and in-memory matching."""

from __future__ import annotations

import math
from collections.abc import Mapping
from typing import Any


OPERATORS = {
    "$eq", "$ne", "$gt", "$gte", "$lt", "$lte",
    "$in", "$nin", "$contains", "$exists",
}
LOGICAL_OPERATORS = {"$and", "$or"}


def validate_filter(filters: Mapping[str, Any] | None) -> dict[str, Any]:
    if filters is None:
        return {}
    if not isinstance(filters, Mapping):
        raise ValueError("filters must be a mapping or None")

    result: dict[str, Any] = {}
    for key, value in filters.items():
        if not isinstance(key, str) or not key.strip():
            raise ValueError("filter keys must be non-empty strings")
        key = key.strip()

        if key in LOGICAL_OPERATORS:
            if not isinstance(value, list) or not value:
                raise ValueError(f"{key} requires a non-empty list")
            result[key] = [validate_filter(part) for part in value]
            continue

        if key.startswith("$"):
            raise ValueError(f"unsupported logical operator: {key}")

        if isinstance(value, Mapping):
            conditions = dict(value)
            if not conditions:
                raise ValueError(f"empty operator mapping for {key}")
            for operator in conditions:
                if operator not in OPERATORS:
                    raise ValueError(f"unsupported filter operator: {operator}")
            result[key] = conditions
        else:
            result[key] = {"$eq": value}

    return result


def _get_path(metadata: Mapping[str, Any], path: str) -> tuple[bool, Any]:
    current: Any = metadata
    for part in path.split("."):
        if not isinstance(current, Mapping) or part not in current:
            return False, None
        current = current[part]
    return True, current


def _compare(actual: Any, expected: Any, operator: str) -> bool:
    if operator == "$exists":
        return bool(expected) == (actual is not _MISSING)
    if actual is _MISSING:
        return operator == "$ne"

    try:
        if operator == "$eq":
            return actual == expected
        if operator == "$ne":
            return actual != expected
        if operator == "$gt":
            return actual > expected
        if operator == "$gte":
            return actual >= expected
        if operator == "$lt":
            return actual < expected
        if operator == "$lte":
            return actual <= expected
        if operator == "$in":
            return actual in expected
        if operator == "$nin":
            return actual not in expected
        if operator == "$contains":
            return expected in actual
    except (TypeError, ValueError):
        return False
    return False


_MISSING = object()


def matches_filter(
    metadata: Mapping[str, Any] | None,
    filters: Mapping[str, Any] | None,
) -> bool:
    """Return True when metadata satisfies all supplied conditions."""
    normalized = validate_filter(filters)
    metadata = metadata if isinstance(metadata, Mapping) else {}

    for key, condition in normalized.items():
        if key == "$and":
            if not all(matches_filter(metadata, part) for part in condition):
                return False
            continue
        if key == "$or":
            if not any(matches_filter(metadata, part) for part in condition):
                return False
            continue

        found, value = _get_path(metadata, key)
        actual = value if found else _MISSING
        if not all(_compare(actual, expected, operator)
                   for operator, expected in condition.items()):
            return False

    return True
