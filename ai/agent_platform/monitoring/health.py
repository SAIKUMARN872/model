"""Agent health status and health-check utilities."""

from dataclasses import dataclass
from datetime import datetime, timezone

from ..constants import AgentState


def utc_timestamp():
    return datetime.now(timezone.utc).isoformat()


@dataclass(frozen=True)
class AgentHealth:
    agent_id: str
    healthy: bool
    state: str
    checked_at: str
    details: str = ""


class AgentHealthChecker:
    """Reports health using the current agent manager lifecycle state."""

    def __init__(self, manager):
        self.manager = manager

    def check_agent(self, agent_id):
        try:
            state = self.manager.get_state(agent_id)
            healthy = state in (AgentState.READY, AgentState.RUNNING)
            return AgentHealth(
                agent_id=agent_id,
                healthy=healthy,
                state=state.value,
                checked_at=utc_timestamp(),
                details="" if healthy else f"Agent is in {state.value} state",
            )
        except Exception as exc:
            return AgentHealth(
                agent_id=agent_id,
                healthy=False,
                state="UNKNOWN",
                checked_at=utc_timestamp(),
                details=f"{type(exc).__name__}: {exc}",
            )
