from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .utils import validate_variable_name, validate_variable_type


@dataclass(frozen=True)
class PromptVariable:
    name: str
    required: bool = True
    default: Any = None
    expected_type: type | tuple[type, ...] | None = None
    description: str = ""

    def __post_init__(self) -> None:
        validate_variable_name(self.name)
        if not isinstance(self.required, bool):
            raise TypeError("required must be a boolean")
        if not isinstance(self.description, str):
            raise TypeError("description must be a string")
        if self.expected_type is not None:
            if not isinstance(self.expected_type, (type, tuple)):
                raise TypeError("expected_type must be a type or tuple of types")
            if self.default is not None and not validate_variable_type(
                self.default, self.expected_type
            ):
                raise TypeError(
                    f"default for {self.name!r} does not match expected_type"
                )
        if self.required and self.default is not None:
            raise ValueError("required variables cannot define a default")

    def validate_value(self, value: Any) -> Any:
        if value is None and self.required:
            raise ValueError(f"Required variable {self.name!r} cannot be None")
        if value is not None and self.expected_type is not None:
            if not validate_variable_type(value, self.expected_type):
                expected = getattr(self.expected_type, "__name__", str(self.expected_type))
                raise TypeError(
                    f"Variable {self.name!r} must have type {expected}"
                )
        return value


class VariableSet:
    """Ordered collection of uniquely named prompt variable definitions."""

    def __init__(self, variables: list[PromptVariable] | tuple[PromptVariable, ...] = ()) -> None:
        if isinstance(variables, (str, bytes)):
            raise TypeError("variables must be a sequence of PromptVariable objects")
        self._variables: dict[str, PromptVariable] = {}
        for variable in variables:
            self.add(variable)

    def add(self, variable: PromptVariable) -> None:
        if not isinstance(variable, PromptVariable):
            raise TypeError("variable must be a PromptVariable")
        if variable.name in self._variables:
            raise ValueError(f"Duplicate variable: {variable.name!r}")
        self._variables[variable.name] = variable

    def get(self, name: str) -> PromptVariable:
        try:
            return self._variables[name]
        except KeyError as exc:
            raise KeyError(f"Unknown variable: {name!r}") from exc

    def names(self) -> tuple[str, ...]:
        return tuple(self._variables)

    def as_dict(self) -> dict[str, PromptVariable]:
        return dict(self._variables)

    def __len__(self) -> int:
        return len(self._variables)

    def __iter__(self):
        return iter(self._variables.values())
