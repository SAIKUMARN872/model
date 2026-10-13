from threading import RLock

from ..constants import AgentState, ExecutionStatus
from ..exceptions import AgentExecutionError
from .lifecycle import AgentLifecycle


class AgentManager:
    """Manages agent registration, lifecycle, and engine-backed execution."""

    def __init__(self, engine, lifecycle=None):
        self.engine = engine
        self.lifecycle = lifecycle or AgentLifecycle()
        self._lock = RLock()

    def register_agent(self, metadata, agent):
        with self._lock:
            self.engine.register_agent(metadata, agent)
            try:
                self.lifecycle.register(metadata.agent_id, AgentState.CREATED)
            except Exception:
                self.engine.registry.unregister(metadata.agent_id)
                raise
        return metadata

    def start_agent(self, agent_id):
        self.engine.registry.get(agent_id)
        return self.lifecycle.start(agent_id)

    def stop_agent(self, agent_id):
        return self.lifecycle.stop(agent_id)

    def get_state(self, agent_id):
        return self.lifecycle.get_state(agent_id)

    def execute(self, request):
        self.lifecycle.begin_execution(request.agent_id)
        try:
            result = self.engine.execute(request)
        except Exception:
            self.lifecycle.finish_execution(request.agent_id, succeeded=False)
            raise

        succeeded = result.status == ExecutionStatus.SUCCESS
        self.lifecycle.finish_execution(
            request.agent_id, succeeded=succeeded
        )
        return result

    def unregister_agent(self, agent_id):
        with self._lock:
            self.lifecycle.unregister(agent_id)
            return self.engine.registry.unregister(agent_id)

    def list_agents(self, enabled_only=False):
        return self.engine.list_agents(enabled_only=enabled_only)
