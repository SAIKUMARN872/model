from __future__ import annotations

from typing import Any

from ..exceptions import AgentValidationError
from ..models import AgentContext
from .utils import validate_mapping


def context_snapshot(context: AgentContext) -> dict[str, Any]:
    """Return a detached, serializable view of an agent context."""
    if not isinstance(context, AgentContext):
        raise AgentValidationError("context must be an AgentContext")

    return {
        "conversation_id": context.conversation_id,
        "user_id": context.user_id,
        "session_id": context.session_id,
        "metadata": dict(context.metadata),
        "memory": dict(context.memory),
        "permissions": list(context.permissions),
    }


def merge_context(
    context: AgentContext,
    *,
    metadata: dict[str, Any] | None = None,
    memory: dict[str, Any] | None = None,
    permissions: tuple[str, ...] | None = None,
) -> AgentContext:
    """Create a new context with explicitly supplied updates."""
    if not isinstance(context, AgentContext):
        raise AgentValidationError("context must be an AgentContext")

    merged_metadata = dict(context.metadata)
    merged_memory = dict(context.memory)

    if metadata is not None:
        merged_metadata.update(validate_mapping(metadata, "metadata"))

    if memory is not None:
        merged_memory.update(validate_mapping(memory, "memory"))

    merged_permissions = context.permissions
    if permissions is not None:
        if not isinstance(permissions, tuple):
            raise AgentValidationError("permissions must be a tuple of strings")
        if any(not isinstance(item, str) or not item.strip() for item in permissions):
            raise AgentValidationError(
                "permissions must contain only non-empty strings"
            )
        merged_permissions = permissions

    return AgentContext(
        conversation_id=context.conversation_id,
        user_id=context.user_id,
        session_id=context.session_id,
        metadata=merged_metadata,
        memory=merged_memory,
        permissions=merged_permissions,
    )


__all__ = ["context_snapshot", "merge_context"]
