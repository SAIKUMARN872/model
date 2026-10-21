from __future__ import annotations

from typing import Sequence

from ai.memory.manager.manager import MemoryManager
from ai.memory.manager.utils import (
    MemoryContext,
    MemoryOperationResult,
    validate_id,
    validate_limit,
    validate_text,
    validate_json_mapping,
)


class MemoryController:
    def __init__(self, manager: MemoryManager) -> None:
        if not isinstance(manager, MemoryManager):
            raise ValueError("manager must be a MemoryManager")
        self.manager = manager

    def remember(
        self,
        context: MemoryContext,
        content: str,
        *,
        category: str = "general",
        metadata: dict | None = None,
        backends: Sequence[str] | None = None,
    ) -> MemoryOperationResult:
        content = validate_text(content, "content")
        category = validate_id(category, "category")
        safe_metadata = validate_json_mapping(metadata)
        ids = self.manager.remember(
            context,
            content,
            category=category,
            metadata=safe_metadata,
            backends=backends,
        )
        partial_failures = ids.pop("_partial_failures", None)
        details = {"backend_memory_ids": ids}
        if partial_failures:
            details["partial_failures"] = partial_failures
        return MemoryOperationResult(
            success=True,
            operation="remember",
            memory_id=next(iter(ids.values()), None),
            metadata=details,
        )

    def recall(
        self,
        context: MemoryContext,
        query: str,
        *,
        limit: int = 10,
        category: str | None = None,
        backends: Sequence[str] | None = None,
    ) -> MemoryOperationResult:
        limit = validate_limit(limit, maximum=100)
        items = self.manager.recall(
            context,
            validate_text(query, "query"),
            limit=limit,
            category=category,
            backends=backends,
        )
        return MemoryOperationResult(
            success=True,
            operation="recall",
            items=tuple(items),
            metadata={"result_count": len(items)},
        )

    def forget(
        self,
        context: MemoryContext,
        memory_id: str,
        *,
        backend: str,
    ) -> MemoryOperationResult:
        deleted = self.manager.forget(context, memory_id, backend=backend)
        return MemoryOperationResult(
            success=deleted,
            operation="forget",
            memory_id=memory_id,
            metadata={"deleted": deleted, "backend": backend},
        )
