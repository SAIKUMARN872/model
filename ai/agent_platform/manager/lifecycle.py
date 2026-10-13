from threading import RLock

from ..constants import AgentState
from ..exceptions import AgentExecutionError, AgentNotFoundError


class AgentLifecycle:
    """Thread-safe lifecycle state tracking for registered agents."""

    def __init__(self):
        self._states = {}
        self._lock = RLock()

    def register(self, agent_id, initial_state=AgentState.CREATED):
        with self._lock:
            if agent_id in self._states:
                raise AgentExecutionError(
                    f"Lifecycle already exists for agent: {agent_id}"
                )
            self._states[agent_id] = initial_state
            return initial_state

    def get_state(self, agent_id):
        with self._lock:
            if agent_id not in self._states:
                raise AgentNotFoundError(f"Agent not found: {agent_id}")
            return self._states[agent_id]

    def start(self, agent_id):
        with self._lock:
            state = self._require_agent(agent_id)
            if state == AgentState.RUNNING:
                raise AgentExecutionError(
                    f"Cannot start an already running agent: {agent_id}"
                )
            self._states[agent_id] = AgentState.READY
            return AgentState.READY

    def stop(self, agent_id):
        with self._lock:
            state = self._require_agent(agent_id)
            if state == AgentState.RUNNING:
                raise AgentExecutionError(
                    f"Cannot stop an agent while it is running: {agent_id}"
                )
            self._states[agent_id] = AgentState.STOPPED
            return AgentState.STOPPED

    def begin_execution(self, agent_id):
        with self._lock:
            state = self._require_agent(agent_id)
            if state != AgentState.READY:
                raise AgentExecutionError(
                    f"Agent {agent_id} is not ready; current state: {state.value}"
                )
            self._states[agent_id] = AgentState.RUNNING
            return AgentState.RUNNING

    def finish_execution(self, agent_id, succeeded=True):
        with self._lock:
            state = self._require_agent(agent_id)
            if state != AgentState.RUNNING:
                raise AgentExecutionError(
                    f"Agent {agent_id} is not running"
                )
            self._states[agent_id] = (
                AgentState.READY if succeeded else AgentState.FAILED
            )
            return self._states[agent_id]

    def unregister(self, agent_id):
        with self._lock:
            state = self._require_agent(agent_id)
            if state == AgentState.RUNNING:
                raise AgentExecutionError(
                    f"Cannot unregister a running agent: {agent_id}"
                )
            return self._states.pop(agent_id)

    def _require_agent(self, agent_id):
        if agent_id not in self._states:
            raise AgentNotFoundError(f"Agent not found: {agent_id}")
        return self._states[agent_id]
