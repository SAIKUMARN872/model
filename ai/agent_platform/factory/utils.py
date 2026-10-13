from __future__ import annotations

from collections.abc import Callable
from typing import Any

from ..models import AgentMetadata
from .factory import AgentFactory


def register_agent_type(
    factory: AgentFactory,
    factory_key: str,
    creator: Callable[..., Any],
) -> None:
    factory.register_builder(factory_key, creator)


def create_agent(
    factory: AgentFactory,
    metadata: AgentMetadata,
    **kwargs: Any,
) -> Any:
    return factory.create(metadata, **kwargs)
