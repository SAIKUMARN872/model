import json
from typing import Any

from ai.agents.enterprise.enterprise import EnterpriseAgent
from ai.agents.enterprise.constants import EnterpriseDomain

from .workflows import CRMWorkflow
from .tools import CRMTools


class CRMAgent(EnterpriseAgent):
    """Automotive-sales CRM agent backed by a local in-memory workflow."""

    def __init__(
        self,
        agent_id: str = "crm-agent",
        name: str = "CRM Agent",
        tools: CRMTools | None = None,
        workflow: CRMWorkflow | None = None,
    ) -> None:
        self.crm_workflow = workflow or CRMWorkflow(tools=tools)
        super().__init__(
            agent_id=agent_id,
            domain=EnterpriseDomain.CRM,
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
                action = getattr(task, "task_type", None)
            if not isinstance(payload, dict):
                payload = {}

        if not action:
            raise ValueError(
                "CRM task needs an action, such as create_customer or create_lead"
            )
        result = self.crm_workflow.execute(str(action), payload)
        return json.dumps(result, ensure_ascii=False, default=str)
