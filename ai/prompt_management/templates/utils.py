from __future__ import annotations

import re
from collections.abc import Mapping
from typing import Any

# Simple named placeholders: {question}, {context}.
# Attribute/index expressions and anonymous positional fields are not supported.
_VARIABLE_PATTERN = re.compile(r"\{([A-Za-z_][A-Za-z0-9_]*)\}")
_VALID_ROLES = frozenset({"system", "developer", "user", "assistant", "tool"})


def validate_template_source(template: str) -> str:
    if not isinstance(template, str):
        raise TypeError("template must be a string")
    if not template.strip():
        raise ValueError("template must not be empty")

    # Reject unmatched braces and unsupported formatting expressions.
    remainder = _VARIABLE_PATTERN.sub("", template)
    if "{" in remainder or "}" in remainder:
        raise ValueError(
            "template contains an invalid placeholder; use simple {variable_name} fields"
        )
    return template


def find_template_variables(template: str) -> tuple[str, ...]:
    validate_template_source(template)
    return tuple(dict.fromkeys(_VARIABLE_PATTERN.findall(template)))


def validate_variables(
    required_variables: tuple[str, ...],
    values: Mapping[str, Any],
) -> dict[str, Any]:
    if not isinstance(values, Mapping):
        raise TypeError("template variables must be provided as a mapping")

    missing = set(required_variables) - set(values)
    extra = set(values) - set(required_variables)
    if missing:
        raise ValueError(f"Missing template variables: {sorted(missing)}")
    if extra:
        raise ValueError(f"Unexpected template variables: {sorted(extra)}")

    if any(not isinstance(key, str) for key in values):
        raise TypeError("template variable names must be strings")
    return dict(values)


def validate_role(role: str) -> str:
    if not isinstance(role, str):
        raise TypeError("message role must be a string")
    if role not in _VALID_ROLES:
        raise ValueError(f"Unsupported message role: {role!r}")
    return role
