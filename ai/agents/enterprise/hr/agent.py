import json
from typing import Any

from ai.agents.enterprise.constants import EnterpriseDomain
from ai.agents.enterprise.enterprise import EnterpriseAgent

from .tools import HRTools
from .workflows import HRWorkflow


class HRAgent(EnterpriseAgent):
    """HR operations agent; decisions and external integrations remain controlled."""

    def __init__(
        self,
        agent_id: str = "hr-agent",
        name: str = "HR Agent",
        tools: HRTools | None = None,
        workflow: HRWorkflow | None = None,
    ) -> None:
        self.hr_workflow = workflow or HRWorkflow(tools=tools)
        super().__init__(
            agent_id=agent_id,
            domain=EnterpriseDomain.HR,
            name=name,
        )

    async def run_task(self, task: Any) -> str:
        if isinstance(task, dict):
            action = task.get("action")
            payload = task.get("payload", {})
        else:
            action = getattr(task, "action", None)
            payload = getattr(task, "payload", {})
        if not action:
            raise ValueError("HR task requires an action")
        result = self.hr_workflow.execute(str(action), payload)
        return json.dumps(result, ensure_ascii=False, default=str)
