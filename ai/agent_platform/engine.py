from __future__ import annotations

from datetime import datetime, timezone
from threading import RLock
from typing import Any

from .constants import AgentState, ExecutionStatus
from .exceptions import (
    AgentExecutionError,
    AgentNotFoundError,
    AgentRegistrationError,
)
from .factory.factory import AgentFactory
from .models import (
    AgentExecutionRequest,
    AgentExecutionResult,
    AgentMetadata,
    AgentRuntimeInfo,
)
from .registry.registry import AgentRegistry
from .utils import validate_execution_request


class AgentPlatformEngine:
    """Unified registration and execution entry point for platform agents."""

    def __init__(
        self,
        registry: AgentRegistry | None = None,
        factory: AgentFactory | None = None,
    ) -> None:
        self.registry = registry or AgentRegistry()
        self.factory = factory or AgentFactory()
        self._runtime: dict[str, AgentRuntimeInfo] = {}
        self._lock = RLock()

    def register_agent(self, metadata: AgentMetadata, agent: Any) -> None:
        self.registry.register(metadata, agent)
        with self._lock:
            self._runtime[metadata.agent_id] = AgentRuntimeInfo(
                agent_id=metadata.agent_id,
                state=AgentState.READY,
            )

    def register_factory_builder(self, factory_key: str, creator: Any) -> None:
        self.factory.register_builder(factory_key, creator)

    def create_and_register(
        self,
        metadata: AgentMetadata,
        **constructor_kwargs: Any,
    ) -> Any:
        agent = self.factory.create(metadata, **constructor_kwargs)
        self.register_agent(metadata, agent)
        return agent

    def get_runtime_info(self, agent_id: str) -> AgentRuntimeInfo:
        with self._lock:
            if agent_id not in self._runtime:
                raise AgentNotFoundError(
                    f"Runtime information for '{agent_id}' was not found"
                )
            info = self._runtime[agent_id]
            return AgentRuntimeInfo(
                agent_id=info.agent_id,
                state=info.state,
                executions=info.executions,
                failures=info.failures,
                last_error=info.last_error,
                updated_at=info.updated_at,
            )

    def execute(
        self,
        request: AgentExecutionRequest,
    ) -> AgentExecutionResult:
        validate_execution_request(request)

        metadata = self.registry.get_metadata(request.agent_id)
        if not metadata.enabled:
            raise AgentExecutionError(
                f"Agent '{request.agent_id}' is disabled"
            )

        agent = self.registry.get(request.agent_id)
        started_at = datetime.now(timezone.utc)

        with self._lock:
            runtime = self._runtime.setdefault(
                request.agent_id,
                AgentRuntimeInfo(
                    agent_id=request.agent_id,
                    state=AgentState.READY,
                ),
            )
            runtime.state = AgentState.RUNNING
            runtime.updated_at = started_at

        try:
            execute_request = getattr(agent, "execute_request", None)
            if callable(execute_request):
                output = execute_request(request)
            else:
                output = agent.execute(request.input)

            completed_at = datetime.now(timezone.utc)

            with self._lock:
                runtime = self._runtime[request.agent_id]
                runtime.state = AgentState.READY
                runtime.executions += 1
                runtime.last_error = None
                runtime.updated_at = completed_at

            return AgentExecutionResult(
                request_id=request.request_id,
                agent_id=request.agent_id,
                status=ExecutionStatus.SUCCESS,
                output=output,
                started_at=started_at,
                completed_at=completed_at,
            )

        except Exception as exc:
            completed_at = datetime.now(timezone.utc)

            with self._lock:
                runtime = self._runtime[request.agent_id]
                runtime.state = AgentState.FAILED
                runtime.failures += 1
                runtime.last_error = f"{type(exc).__name__}: {exc}"
                runtime.updated_at = completed_at

            return AgentExecutionResult(
                request_id=request.request_id,
                agent_id=request.agent_id,
                status=ExecutionStatus.ERROR,
                error=f"{type(exc).__name__}: {exc}",
                started_at=started_at,
                completed_at=completed_at,
            )

    def list_agents(self, *, enabled_only: bool = False) -> list[AgentMetadata]:
        return self.registry.list_metadata(enabled_only=enabled_only)
