"""
Tool adapter for the AI tools system.

Converts regular Python functions into standardized
AI-callable tools.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable

from .utils import (
    generate_tool_id,
    get_function_description,
    get_function_parameters,
    is_async_callable,
    normalize_tool_name,
)


@dataclass
class ToolDefinition:
    """
    Public definition of an AI tool.
    """

    name: str

    description: str

    tool_id: str

    parameters: dict[str, Any] = field(
        default_factory=dict
    )

    category: str = "general"

    version: str = "1.0.0"

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    is_async: bool = False

    def to_dict(self) -> dict[str, Any]:

        return {
            "tool_id": self.tool_id,
            "name": self.name,
            "description": self.description,
            "parameters": dict(
                self.parameters
            ),
            "category": self.category,
            "version": self.version,
            "metadata": dict(
                self.metadata
            ),
            "is_async": self.is_async,
        }


@dataclass
class ToolCall:
    """
    Represents a request to invoke a tool.
    """

    tool_name: str

    arguments: dict[str, Any] = field(
        default_factory=dict
    )

    call_id: str = field(
        default_factory=lambda: generate_tool_id(
            "call"
        )
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "call_id": self.call_id,
            "tool_name": self.tool_name,
            "arguments": dict(
                self.arguments
            ),
            "metadata": dict(
                self.metadata
            ),
        }


@dataclass
class ToolAdapter:
    """
    Wraps a Python callable as an AI tool.
    """

    function: Callable[..., Any]

    name: str | None = None

    description: str | None = None

    category: str = "general"

    version: str = "1.0.0"

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if not callable(
            self.function
        ):

            raise TypeError(
                "function must be callable"
            )

        if self.name is None:

            self.name = getattr(
                self.function,
                "__name__",
                "tool",
            )

        self.name = normalize_tool_name(
            self.name
        )

        if self.description is None:

            self.description = (
                get_function_description(
                    self.function
                )
            )

        self.metadata = dict(
            self.metadata
        )

    @property
    def tool_id(self) -> str:

        return generate_tool_id(
            self.name
        )

    @property
    def is_async(self) -> bool:

        return is_async_callable(
            self.function
        )

    @property
    def parameters(self) -> dict[str, Any]:

        return get_function_parameters(
            self.function
        )

    def definition(
        self,
    ) -> ToolDefinition:

        return ToolDefinition(
            name=self.name,
            description=self.description or "",
            tool_id=self.tool_id,
            parameters=self.parameters,
            category=self.category,
            version=self.version,
            metadata=dict(
                self.metadata
            ),
            is_async=self.is_async,
        )

    def schema(
        self,
    ) -> dict[str, Any]:
        """
        Return an OpenAI-style function tool schema.
        """

        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": (
                    self.description or ""
                ),
                "parameters": {
                    "type": "object",
                    "properties": self.parameters,
                    "required": [
                        key
                        for key, value
                        in self.parameters.items()
                        if "default" not in value
                    ],
                },
            },
        }


def adapt_tool(
    function: Callable[..., Any],
    name: str | None = None,
    description: str | None = None,
    category: str = "general",
    version: str = "1.0.0",
    metadata: dict[str, Any] | None = None,
) -> ToolAdapter:
    """
    Convert a Python function into a ToolAdapter.
    """

    return ToolAdapter(
        function=function,
        name=name,
        description=description,
        category=category,
        version=version,
        metadata=metadata or {},
    )