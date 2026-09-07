"""
Utility functions for agent management.
"""

from __future__ import annotations

from typing import Any, Dict, Mapping


def validate_agent_id(agent_id: str) -> str:
    """
    Validate and normalize an agent ID.
    """

    if not isinstance(agent_id, str):
        raise TypeError("agent_id must be a string")

    agent_id = agent_id.strip()

    if not agent_id:
        raise ValueError("agent_id cannot be empty")

    if len(agent_id) > 200:
        raise ValueError(
            "agent_id cannot exceed 200 characters"
        )

    return agent_id


def get_agent_name(agent: Any) -> str:
    """
    Resolve a human-readable agent name.
    """

    name = getattr(agent, "name", None)

    if name:
        return str(name)

    config = getattr(agent, "config", None)

    if config is not None:
        config_name = getattr(config, "name", None)

        if config_name:
            return str(config_name)

    return agent.__class__.__name__


def get_agent_metadata(agent: Any) -> Dict[str, Any]:
    """
    Extract metadata from an agent.
    """

    metadata = getattr(agent, "metadata", None)

    if isinstance(metadata, Mapping):
        return dict(metadata)

    config = getattr(agent, "config", None)

    if config is not None:
        config_metadata = getattr(
            config,
            "metadata",
            None,
        )

        if isinstance(config_metadata, Mapping):
            return dict(config_metadata)

    return {}


def agent_info(
    agent_id: str,
    agent: Any,
    state: str,
) -> Dict[str, Any]:
    """
    Build a serializable agent information object.
    """

    return {
        "id": validate_agent_id(agent_id),
        "name": get_agent_name(agent),
        "class": agent.__class__.__name__,
        "module": agent.__class__.__module__,
        "state": state,
        "metadata": get_agent_metadata(agent),
    }


def merge_agent_metadata(
    agent: Any,
    metadata: Mapping[str, Any],
) -> Dict[str, Any]:
    """
    Merge additional metadata into agent metadata.
    """

    current = get_agent_metadata(agent)
    current.update(dict(metadata))

    return current


def is_agent_running(agent: Any) -> bool:
    """
    Determine whether an agent reports itself as running.
    """

    state = getattr(agent, "state", None)

    if state is None:
        return True

    if hasattr(state, "value"):
        state = state.value

    return str(state).lower() in {
        "running",
        "active",
        "ready",
    }


def safe_call(
    callback: Any,
    *args: Any,
    **kwargs: Any,
) -> Any:
    """
    Execute a callable after validating it.
    """

    if not callable(callback):
        raise TypeError("callback must be callable")

    return callback(*args, **kwargs)