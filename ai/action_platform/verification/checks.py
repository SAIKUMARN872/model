"""Reusable checks for verifying action execution results."""

from typing import Any, Mapping


def check_required_fields(
    payload: Mapping[str, Any],
    required_fields: tuple[str, ...],
) -> dict[str, bool]:
    """Check that required fields exist and contain usable values."""
    if not isinstance(payload, Mapping):
        raise TypeError("payload must be a mapping")

    if not isinstance(required_fields, tuple):
        raise TypeError("required_fields must be a tuple")

    results: dict[str, bool] = {}
    for field_name in required_fields:
        if not isinstance(field_name, str) or not field_name.strip():
            raise ValueError("required field names must be non-empty strings")
        value = payload.get(field_name)
        results[f"required:{field_name}"] = (
            value is not None
            and not (isinstance(value, str) and not value.strip())
        )
    return results


def check_expected_values(
    payload: Mapping[str, Any],
    expected: Mapping[str, Any],
) -> dict[str, bool]:
    """Compare actual payload values with expected values."""
    if not isinstance(payload, Mapping) or not isinstance(expected, Mapping):
        raise TypeError("payload and expected must be mappings")

    return {
        f"matches:{field_name}": (
            field_name in payload and payload[field_name] == expected_value
        )
        for field_name, expected_value in expected.items()
    }


def check_status(
    payload: Mapping[str, Any],
    accepted_statuses: tuple[str, ...],
) -> dict[str, bool]:
    """Check whether the reported status is explicitly accepted."""
    if not isinstance(payload, Mapping):
        raise TypeError("payload must be a mapping")
    if not isinstance(accepted_statuses, tuple) or not accepted_statuses:
        raise ValueError("accepted_statuses must be a non-empty tuple")
    if not all(isinstance(status, str) and status.strip() for status in accepted_statuses):
        raise ValueError("accepted statuses must be non-empty strings")

    actual = payload.get("status")
    return {
        "status:accepted": (
            isinstance(actual, str)
            and actual.casefold() in {status.casefold() for status in accepted_statuses}
        )
    }
