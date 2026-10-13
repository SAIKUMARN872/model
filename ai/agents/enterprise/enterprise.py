from __future__ import annotations

from abc import ABC, abstractmethod
import json

from ai.agents.base.agent import BaseAgent
from ai.agents.constants import AgentStatus
from ai.agents.models import AgentContext, AgentRequest

from .constants import EnterpriseDomain
from .exceptions import EnterpriseValidationError
from .models import EnterpriseTask
from .schemas import validate_task_domain


class EnterpriseAgent(BaseAgent, ABC):
    """Shared lifecycle and request adapter for domain-specific agents."""

    def __init__(
        self,
        agent_id: str,
        domain: EnterpriseDomain,
        name: str | None = None,
    ) -> None:
        super().__init__(agent_id=agent_id, name=name)
        if not isinstance(domain, EnterpriseDomain):
            raise EnterpriseValidationError("domain must be an EnterpriseDomain.")
        self.domain = domain

    async def execute(self, request: AgentRequest, context: AgentContext) -> str:
        metadata = dict(request.metadata)
        metadata.update(context.metadata)

        task_data = metadata.get("enterprise_task")
        if isinstance(task_data, EnterpriseTask):
            task = task_data
        elif isinstance(task_data, dict):
            task = EnterpriseTask(
                task_id=task_data.get("task_id") or request.task_id or "task-default",
                domain=EnterpriseDomain(task_data.get("domain", self.domain.value)),
                action=task_data.get("action", request.input),
                payload=task_data.get("payload", {}),
                metadata=task_data.get("metadata", {}),
            )
        else:
            task = EnterpriseTask(
                task_id=request.task_id or "task-default",
                domain=self.domain,
                action=request.input,
                payload=metadata.get("payload", {}),
            )

        validate_task_domain(task, self.domain)
        result = await self.run_task(task)
        if not isinstance(result, str):
            raise EnterpriseValidationError("run_task() must return a string.")
        return result

    @abstractmethod
    async def run_task(self, task: EnterpriseTask) -> str:
        """Implement the workflow for this business domain."""
