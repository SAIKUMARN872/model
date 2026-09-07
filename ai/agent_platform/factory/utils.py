"""
Utilities for the AI Agent Factory.
"""

from __future__ import annotations

from typing import Any, Mapping

from .models import (
    AgentConfig,
    AgentType,
    ModelConfig,
)


def normalize_agent_type(
    agent_type: str | AgentType,
) -> str:
    """Normalize an agent type to its string value."""

    if isinstance(agent_type, AgentType):
        return agent_type.value

    return str(agent_type).strip().lower()


def normalize_model_name(
    model: ModelConfig,
) -> str:
    """Return a normalized provider/model identifier."""

    provider = model.provider.strip().lower()
    model_name = model.model_name.strip()

    return f"{provider}/{model_name}"


def build_agent_kwargs(
    config: AgentConfig,
) -> dict[str, Any]:
    """
    Convert AgentConfig into constructor arguments.
    """

    kwargs: dict[str, Any] = {
        "name": config.name,
        "model": config.model,
        "tools": list(config.tools),
        "memory": config.memory,
        "metadata": dict(config.metadata),
    }

    if config.description:
        kwargs["description"] = config.description

    if config.system_prompt:
        kwargs["system_prompt"] = config.system_prompt

    kwargs.update(dict(config.extra))

    return kwargs


def merge_metadata(
    base: Mapping[str, Any] | None,
    override: Mapping[str, Any] | None,
) -> dict[str, Any]:
    """Merge two metadata dictionaries."""

    result: dict[str, Any] = {}

    if base:
        result.update(base)

    if override:
        result.update(override)

    return result


def is_valid_agent_config(
    config: AgentConfig,
) -> bool:
    """Perform a lightweight configuration check."""

    if not config.name:
        return False

    if config.model is None:
        return False

    return True


def agent_cache_key(
    config: AgentConfig,
) -> str:
    """
    Generate a stable cache key for an agent.
    """

    return (
        f"{normalize_agent_type(config.agent_type)}:"
        f"{config.name}"
    )