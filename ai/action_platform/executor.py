"""Execution facade for ModelNow Action Platform."""

from __future__ import annotations

from typing import Any

from ai.action_platform.core.models import ActionRequest, ActionResult
from ai.action_platform.registry import ActionRegistry
from ai.action_platform.router import ActionRouter


class ActionExecutor:
    """Execute typed action requests through the configured action router."""

    def __init__(self, registry: ActionRegistry) -> None:
        if not isinstance(registry, ActionRegistry):
            raise TypeError("registry must be an ActionRegistry instance.")
        self.registry = registry
        self.router = ActionRouter(registry)

    async def execute(
        self,
        request: ActionRequest,
        context: Any = None,
    ) -> ActionResult:
        """Route and execute a request, preserving router validation and approval."""
        return await self.router.execute(request, context)


__all__ = ["ActionExecutor"]
