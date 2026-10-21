"""Adapt ordinary Python callables to a consistent agent tool interface."""

from __future__ import annotations

import inspect
from dataclasses import dataclass
from typing import Any, Callable

from .utils import (
    validate_arguments,
    validate_description,
    validate_tool_name,
)


@dataclass(frozen=True)
class ToolDefinition:
    name: str
    description: str
    function: Callable[..., Any]

    def __post_init__(self) -> None:
        object.__setattr__(self, "name", validate_tool_name(self.name))
        object.__setattr__(
            self, "description", validate_description(self.description)
        )
        if not callable(self.function):
            raise ValueError("Tool function must be callable.")

    async def invoke(self, arguments: dict[str, Any] | None = None) -> Any:
        kwargs = validate_arguments(arguments)

        try:
            inspect.signature(self.function).bind(**kwargs)
        except TypeError as exc:
            raise ValueError(f"Invalid arguments for tool '{self.name}': {exc}") from exc
        except ValueError:
            # Some built-in callables do not expose a signature.
            pass

        result = self.function(**kwargs)
        if inspect.isawaitable(result):
            result = await result
        return result


class ToolAdapter:
    """Create tool definitions from Python callables."""

    @staticmethod
    def adapt(
        name: str,
        function: Callable[..., Any],
        description: str | None = None,
    ) -> ToolDefinition:
        if description is None:
            description = (inspect.getdoc(function) or "").strip()
        if not description:
            raise ValueError("Provide a description for this tool.")
        return ToolDefinition(name=name, description=description, function=function)
