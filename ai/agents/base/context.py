"""
Base execution context for ModelNow agents.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable


Tool = Callable[..., Any]


@dataclass
class BaseAgentContext:
    """
    Runtime context shared with a base agent.

    The context carries:
        - user input
        - session information
        - metadata
        - conversation history
        - available tools
    """

    user_input: str

    session_id: str | None = None

    user_id: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    history: list[dict[str, Any]] = field(
        default_factory=list
    )

    tools: dict[str, Tool] = field(
        default_factory=dict
    )

    created_at: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    def register_tool(
        self,
        name: str,
        tool: Tool,
    ) -> None:
        """
        Register a callable tool.
        """

        if not name:
            raise ValueError(
                "Tool name cannot be empty"
            )

        if not callable(tool):
            raise TypeError(
                "Tool must be callable"
            )

        self.tools[name] = tool

    def unregister_tool(
        self,
        name: str,
    ) -> bool:
        """
        Remove a tool.

        Returns:
            True if removed, otherwise False.
        """

        if name not in self.tools:
            return False

        del self.tools[name]

        return True

    def get_tool(
        self,
        name: str,
    ) -> Tool:
        """
        Get a registered tool.
        """

        if name not in self.tools:
            raise KeyError(
                f"Tool not found: {name}"
            )

        return self.tools[name]

    def call_tool(
        self,
        name: str,
        *args: Any,
        **kwargs: Any,
    ) -> Any:
        """
        Execute a registered tool.
        """

        tool = self.get_tool(name)

        return tool(
            *args,
            **kwargs,
        )

    def add_message(
        self,
        role: str,
        content: Any,
        **metadata: Any,
    ) -> None:
        """
        Add a message to conversation history.
        """

        if not role:
            raise ValueError(
                "Message role cannot be empty"
            )

        self.history.append(
            {
                "role": role,
                "content": content,
                "timestamp": datetime.now(
                    timezone.utc
                ).isoformat(),
                "metadata": metadata,
            }
        )

    def set(
        self,
        key: str,
        value: Any,
    ) -> None:

        if not key:
            raise ValueError(
                "Context key cannot be empty"
            )

        self.metadata[key] = value

    def get(
        self,
        key: str,
        default: Any = None,
    ) -> Any:

        return self.metadata.get(
            key,
            default,
        )

    def has(
        self,
        key: str,
    ) -> bool:

        return key in self.metadata

    def clear_history(self) -> None:

        self.history.clear()

    def to_dict(
        self,
        include_history: bool = True,
    ) -> dict[str, Any]:

        result = {
            "user_input": self.user_input,
            "session_id": self.session_id,
            "user_id": self.user_id,
            "metadata": dict(self.metadata),
            "tools": list(self.tools.keys()),
            "created_at": self.created_at.isoformat(),
        }

        if include_history:
            result["history"] = list(
                self.history
            )

        return result