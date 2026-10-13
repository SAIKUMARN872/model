from typing import Any


def validate_collection_id(value: str) -> str:
    value = value.strip()
    if not value or len(value) > 128:
        raise ValueError("Collection ID must contain 1–128 characters.")
    return value


def validate_question(value: str) -> str:
    value = value.strip()
    if not value:
        raise ValueError("Question cannot be empty.")
    if len(value) > 12000:
        raise ValueError("Question is too long.")
    return value


def validate_metadata(value: Any) -> dict:
    if value is None:
        return {}
    if not isinstance(value, dict):
        raise ValueError("Metadata must be a dictionary.")
    return value
