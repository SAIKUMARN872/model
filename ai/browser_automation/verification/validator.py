from collections.abc import Mapping
from typing import Any


class VerificationValidationError(ValueError):
    """An invalid verification request or evidence payload."""


def validate_expectation(expectation: Mapping[str, Any]) -> dict[str, Any]:
    """Validate a read-only page verification specification.

    Supported keys: url_contains, title_contains, text_contains,
    selector_visible, selector_hidden.
    """
    if not isinstance(expectation, Mapping):
        raise VerificationValidationError(
            "expectation must be a mapping."
        )

    allowed = {
        "url_contains",
        "title_contains",
        "text_contains",
        "selector_visible",
        "selector_hidden",
    }
    unknown = set(expectation) - allowed
    if unknown:
        raise VerificationValidationError(
            f"Unsupported expectation keys: {', '.join(sorted(map(str, unknown)))}"
        )

    if not expectation:
        raise VerificationValidationError(
            "At least one expected condition is required."
        )

    normalized = dict(expectation)
    for key, value in normalized.items():
        if not isinstance(value, str) or not value.strip():
            raise VerificationValidationError(
                f"{key} must be a non-empty string."
            )

    if (
        "selector_visible" in normalized
        and "selector_hidden" in normalized
        and normalized["selector_visible"] == normalized["selector_hidden"]
    ):
        raise VerificationValidationError(
            "The same selector cannot be expected to be both visible and hidden."
        )

    return normalized
