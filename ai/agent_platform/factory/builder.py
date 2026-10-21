from __future__ import annotations

from collections.abc import Callable
from typing import Any

from ..exceptions import AgentRegistrationError
from ..models import AgentMetadata


class AgentBuilder:
    """Builds agent instances using an explicitly registered constructor."""

    def __init__(self, creator: Callable[..., Any]) -> None:
        if not callable(creator):
            raise TypeError("creator must be callable")
        self._creator = creator

    def build(self, **kwargs: Any) -> Any:
        agent = self._creator(**kwargs)
        if not callable(getattr(agent, "execute", None)):
            raise AgentRegistrationError(
                "Created agent must provide a callable execute method"
            )
        return agent
