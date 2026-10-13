from __future__ import annotations

from typing import Any

from ..models import AgentMetadata


def create_metadata(
    agent_id: str,
    name: str,
    *,
    description: str = "",
    capabilities: tuple[str, ...] | list[str] = (),
    version: str = "1.0.0",
    enabled: bool = True,
    tags: tuple[str, ...] | list[str] = (),
    extra: dict[str, Any] | None = None,
) -> AgentMetadata:
    return AgentMetadata(
        agent_id=agent_id,
        name=name,
        description=description,
        capabilities=tuple(capabilities),
        version=version,
        enabled=enabled,
        tags=tuple(tags),
        extra=dict(extra or {}),
    )
