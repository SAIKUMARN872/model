from __future__ import annotations

import re
from collections.abc import Mapping, Sequence
from typing import Any

from .utils import (
    find_template_variables,
    validate_template_source,
    validate_variables,
)


class PromptTemplate:
    """Reusable string template with explicit variable validation."""

    def __init__(
        self,
        template: str,
        input_variables: Sequence[str] | None = None,
        *,
        name: str | None = None,
    ) -> None:
        validate_template_source(template)

        detected = find_template_variables(template)
        variables = list(detected if input_variables is None else input_variables)

        if any(not isinstance(item, str) or not item.strip() for item in variables):
            raise ValueError("input_variables must contain non-empty strings")
        if len(variables) != len(set(variables)):
            raise ValueError("input_variables must not contain duplicates")

        missing = set(detected) - set(variables)
        unused = set(variables) - set(detected)
        if missing:
            raise ValueError(f"Missing declared input variables: {sorted(missing)}")
        if unused:
            raise ValueError(f"Declared variables not used in template: {sorted(unused)}")

        if name is not None and (not isinstance(name, str) or not name.strip()):
            raise ValueError("name must be a non-empty string when provided")

        self.template = template
        self.input_variables = tuple(variables)
        self.name = name

    def format(self, **kwargs: Any) -> str:
        values = validate_variables(self.input_variables, kwargs)
        try:
            return self.template.format_map(values)
        except (ValueError, IndexError, KeyError) as exc:
            raise ValueError(f"Unable to render prompt template: {exc}") from exc

    def render(self, values: Mapping[str, Any] | None = None, **kwargs: Any) -> str:
        if values is not None and not isinstance(values, Mapping):
            raise TypeError("values must be a mapping")
        combined = dict(values or {})
        overlap = set(combined).intersection(kwargs)
        if overlap:
            raise ValueError(f"Variables supplied more than once: {sorted(overlap)}")
        combined.update(kwargs)
        return self.format(**combined)

    def get_template_variables(self) -> tuple[str, ...]:
        return self.input_variables

    def __repr__(self) -> str:
        return (
            f"PromptTemplate(name={self.name!r}, "
            f"input_variables={self.input_variables!r})"
        )
