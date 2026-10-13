from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from .utils import find_placeholders, validate_context
from .variables import PromptVariable, VariableSet


class VariableResolver:
    """Resolve explicit context values, then optional defaults."""

    def __init__(self, variables: VariableSet | list[PromptVariable] | tuple[PromptVariable, ...] = ()) -> None:
        self._variables = variables if isinstance(variables, VariableSet) else VariableSet(variables)

    @property
    def variables(self) -> VariableSet:
        return self._variables

    def resolve(
        self,
        context: Mapping[str, Any] | None = None,
        *,
        strict: bool = True,
    ) -> dict[str, Any]:
        if not isinstance(strict, bool):
            raise TypeError("strict must be a boolean")
        supplied = validate_context({} if context is None else context)
        definitions = self._variables.as_dict()

        unknown = set(supplied) - set(definitions)
        if strict and unknown:
            raise ValueError(f"Unknown variables: {sorted(unknown)}")

        resolved: dict[str, Any] = {}
        for name, definition in definitions.items():
            if name in supplied:
                value = definition.validate_value(supplied[name])
                resolved[name] = value
            elif definition.default is not None:
                resolved[name] = definition.validate_value(definition.default)
            elif definition.required:
                raise ValueError(f"Missing required variable: {name!r}")
            else:
                resolved[name] = None

        if not strict:
            for name in unknown:
                resolved[name] = supplied[name]
        return resolved

    def resolve_for_template(
        self,
        template: str,
        context: Mapping[str, Any] | None = None,
    ) -> dict[str, Any]:
        placeholders = set(find_placeholders(template))
        supplied = validate_context({} if context is None else context)
        needed = placeholders.intersection(self._variables.names())
        unknown_placeholders = placeholders - set(self._variables.names())
        if unknown_placeholders:
            missing_from_definitions = sorted(unknown_placeholders - set(supplied))
            if missing_from_definitions:
                raise ValueError(
                    f"Template variables have no definitions or supplied values: "
                    f"{missing_from_definitions}"
                )

        selected = {
            name: supplied[name] for name in placeholders if name in supplied
        }
        for name in needed:
            if name not in selected:
                definition = self._variables.get(name)
                if definition.default is not None:
                    selected[name] = definition.default
                elif definition.required:
                    raise ValueError(f"Missing required variable: {name!r}")
                else:
                    selected[name] = None

        result: dict[str, Any] = {}
        for name, value in selected.items():
            if name in self._variables.names():
                value = self._variables.get(name).validate_value(value)
            result[name] = value
        return result
