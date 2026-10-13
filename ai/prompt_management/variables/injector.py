from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from .resolver import VariableResolver
from .utils import find_placeholders, validate_context


class VariableInjector:
    """Inject resolved values into named placeholders in a prompt string."""

    def __init__(self, resolver: VariableResolver | None = None) -> None:
        if resolver is not None and not isinstance(resolver, VariableResolver):
            raise TypeError("resolver must be a VariableResolver")
        self._resolver = resolver or VariableResolver()

    def inject(
        self,
        template: str,
        context: Mapping[str, Any] | None = None,
    ) -> str:
        placeholders = find_placeholders(template)
        supplied = validate_context({} if context is None else context)
        missing = set(placeholders) - set(supplied)

        if self._resolver.variables.names():
            resolved = self._resolver.resolve_for_template(template, supplied)
        else:
            resolved = supplied

        missing = set(placeholders) - set(resolved)
        if missing:
            raise ValueError(f"Missing template values: {sorted(missing)}")

        # Values are rendered as text; never interpret braces inside values as templates.
        return _replace_placeholders(template, resolved)


def _replace_placeholders(template: str, values: Mapping[str, Any]) -> str:
    import re

    pattern = re.compile(r"\{([A-Za-z_][A-Za-z0-9_]*)\}")

    def replacement(match: re.Match[str]) -> str:
        name = match.group(1)
        if name not in values:
            raise ValueError(f"Missing template value: {name!r}")
        value = values[name]
        if value is None:
            raise ValueError(f"Template value {name!r} cannot be None")
        return str(value)

    return pattern.sub(replacement, template)
