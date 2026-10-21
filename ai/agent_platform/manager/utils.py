from .lifecycle import AgentLifecycle


def is_agent_ready(lifecycle, agent_id):
    from ..constants import AgentState
    return lifecycle.get_state(agent_id) == AgentState.READY


def require_agent_ready(lifecycle, agent_id):
    from ..exceptions import AgentExecutionError

    state = lifecycle.get_state(agent_id)
    if not is_agent_ready(lifecycle, agent_id):
        raise AgentExecutionError(
            f"Agent {agent_id} is not ready; current state: {state.value}"
        )
    return state


__all__ = ["AgentLifecycle", "is_agent_ready", "require_agent_ready"]
