from __future__ import annotations

from typing import Any, Sequence

from ai.memory.manager.controller import MemoryController
from ai.memory.manager.utils import (
    MemoryContext,
    MemoryOperationResult,
    validate_id,
    validate_text,
)


class MemoryOrchestrator:
    """Small orchestration boundary for memory operations."""

    SUPPORTED_OPERATIONS = frozenset({"remember", "recall", "forget"})

    def __init__(self, controller: MemoryController) -> None:
        if not isinstance(controller, MemoryController):
            raise ValueError("controller must be a MemoryController")
        self.controller = controller

    def execute(
        self,
        operation: str,
        context: MemoryContext,
        **kwargs: Any,
    ) -> MemoryOperationResult:
        operation = validate_id(operation, "operation").casefold()
        if operation not in self.SUPPORTED_OPERATIONS:
            raise ValueError(f"unsupported memory operation: {operation}")
        if not isinstance(context, MemoryContext):
            raise ValueError("context must be a MemoryContext")

        if operation == "remember":
            allowed = {"content", "category", "metadata", "backends"}
            self._reject_unknown(kwargs, allowed)
            if "content" not in kwargs:
                raise ValueError("remember requires content")
            return self.controller.remember(context, **kwargs)

        if operation == "recall":
            allowed = {"query", "limit", "category", "backends"}
            self._reject_unknown(kwargs, allowed)
            if "query" not in kwargs:
                raise ValueError("recall requires query")
            return self.controller.recall(context, **kwargs)

        allowed = {"memory_id", "backend"}
        self._reject_unknown(kwargs, allowed)
        if "memory_id" not in kwargs or "backend" not in kwargs:
            raise ValueError("forget requires memory_id and backend")
        return self.controller.forget(context, **kwargs)

    @staticmethod
    def _reject_unknown(kwargs: dict[str, Any], allowed: set[str]) -> None:
        unknown = set(kwargs) - allowed
        if unknown:
            raise ValueError(
                "unsupported argument(s): " + ", ".join(sorted(unknown))
            )
