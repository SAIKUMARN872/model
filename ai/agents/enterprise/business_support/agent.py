import json
from typing import Any

from ai.agents.enterprise.constants import EnterpriseDomain
from ai.agents.enterprise.enterprise import EnterpriseAgent

from .tools import BusinessSupportTools
from .workflows import BusinessSupportWorkflow


class BusinessSupportAgent(EnterpriseAgent):
    def __init__(
        self,
        agent_id: str = "business-support-agent",
        name: str = "Business Support Agent",
        tools: BusinessSupportTools | None = None,
        workflow: BusinessSupportWorkflow | None = None,
    ) -> None:
        self.support_workflow = workflow or BusinessSupportWorkflow(tools=tools)
        super().__init__(
            agent_id=agent_id,
            domain=EnterpriseDomain.BUSINESS_SUPPORT,
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
            raise ValueError("Business support task requires an action")
        result = self.support_workflow.execute(str(action), payload)
        return json.dumps(result, ensure_ascii=False, default=str)
