from __future__ import annotations

from ai.prompt_management.exceptions import PromptValidationError


def validate_text(value: str, field_name: str = "text") -> str:
    """Require non-empty text and return its trimmed form."""
    if not isinstance(value, str):
        raise PromptValidationError(f"{field_name} must be a string.")

    result = value.strip()
    if not result:
        raise PromptValidationError(f"{field_name} cannot be empty.")

    return result


def join_nonempty(*parts: str, separator: str = "\n\n") -> str:
    """Join non-empty text sections without introducing blank sections."""
    cleaned: list[str] = []
    for part in parts:
        if not isinstance(part, str):
            raise PromptValidationError("All text sections must be strings.")
        if part.strip():
            cleaned.append(part.strip())
    return separator.join(cleaned)
