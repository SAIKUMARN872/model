from __future__ import annotations

import re
from typing import Any

from .exceptions import EnterpriseValidationError


def validate_identifier(value: str, field_name: str = "identifier") -> str:
    if not isinstance(value, str):
        raise EnterpriseValidationError(f"{field_name} must be a string.")
    value = value.strip()
    if not value or len(value) > 128:
        raise EnterpriseValidationError(
            f"{field_name} must contain 1-128 characters."
        )
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.:-]*", value):
        raise EnterpriseValidationError(f"{field_name} contains invalid characters.")
    return value


def validate_non_empty_text(value: str, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise EnterpriseValidationError(f"{field_name} must be non-empty text.")
    return value.strip()


def validate_metadata(value: Any) -> dict[str, Any]:
    if value is None:
        return {}
    if not isinstance(value, dict):
        raise EnterpriseValidationError("metadata must be a dictionary.")
    return dict(value)
