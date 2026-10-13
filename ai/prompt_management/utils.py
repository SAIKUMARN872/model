from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any, Mapping

from ai.prompt_management.constants import (
    MAX_PROMPT_NAME_LENGTH,
    MAX_TEMPLATE_LENGTH,
    MAX_VARIABLES,
)
from ai.prompt_management.exceptions import PromptValidationError


_VARIABLE_PATTERN = re.compile(r"{{\s*([A-Za-z_][A-Za-z0-9_]*)\s*}}")


def utc_now() -> datetime:
    """Return the current timezone-aware UTC timestamp."""
    return datetime.now(timezone.utc)


def validate_prompt_name(name: str) -> str:
    """Validate and normalize a prompt name."""
    if not isinstance(name, str):
        raise PromptValidationError("Prompt name must be a string.")

    normalized = name.strip()

    if not normalized:
        raise PromptValidationError("Prompt name is required.")

    if len(normalized) > MAX_PROMPT_NAME_LENGTH:
        raise PromptValidationError(
            f"Prompt name cannot exceed {MAX_PROMPT_NAME_LENGTH} characters."
        )

    return normalized


def validate_template(template: str) -> str:
    """Validate a prompt template's type, content, and size."""
    if not isinstance(template, str):
        raise PromptValidationError("Prompt template must be a string.")

    if not template.strip():
        raise PromptValidationError("Prompt template cannot be empty.")

    if len(template) > MAX_TEMPLATE_LENGTH:
        raise PromptValidationError(
            f"Prompt template cannot exceed {MAX_TEMPLATE_LENGTH} characters."
        )

    return template


def extract_template_variables(template: str) -> tuple[str, ...]:
    """Return unique variable names in their first-occurrence order."""
    validate_template(template)
    return tuple(dict.fromkeys(_VARIABLE_PATTERN.findall(template)))


def validate_variable_names(names: tuple[str, ...] | list[str]) -> tuple[str, ...]:
    """Validate a collection of variable names and reject duplicates."""
    if not isinstance(names, (tuple, list)):
        raise PromptValidationError("Variable names must be a list or tuple.")

    if len(names) > MAX_VARIABLES:
        raise PromptValidationError(
            f"A prompt can define at most {MAX_VARIABLES} variables."
        )

    for name in names:
        if not isinstance(name, str) or not name.isidentifier():
            raise PromptValidationError(
                f"Invalid prompt variable name: {name!r}"
            )

    if len(names) != len(set(names)):
        raise PromptValidationError("Prompt variable names must be unique.")

    return tuple(names)


def validate_declared_variables(
    template: str,
    declared_names: tuple[str, ...] | list[str],
) -> None:
    """Ensure every template variable is explicitly declared."""
    declared = set(validate_variable_names(declared_names))
    referenced = set(extract_template_variables(template))
    unknown = referenced - declared

    if unknown:
        raise PromptValidationError(
            "Template references undeclared variables: "
            + ", ".join(sorted(unknown))
        )


def copy_metadata(metadata: Mapping[str, Any] | None) -> dict[str, Any]:
    """Return a defensive copy of prompt metadata."""
    if metadata is None:
        return {}

    if not isinstance(metadata, Mapping):
        raise PromptValidationError("Prompt metadata must be a mapping.")

    return dict(metadata)
