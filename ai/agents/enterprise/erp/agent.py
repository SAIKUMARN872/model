import json
from typing import Any

from ai.agents.enterprise.constants import EnterpriseDomain
from ai.agents.enterprise.enterprise import EnterpriseAgent

from .tools import ERPTools
from .workflows import ERPWorkflow


class ERPAgent(EnterpriseAgent):
    def __init__(
        self,
        agent_id: str = "erp-agent",
        name: str = "ERP Agent",
        tools: ERPTools | None = None,
        workflow: ERPWorkflow | None = None,
    ) -> None:
        self.erp_workflow = workflow or ERPWorkflow(tools=tools)
        super().__init__(
            agent_id=agent_id,
            domain=EnterpriseDomain.ERP,
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
            raise ValueError("ERP task requires an action")
        return json.dumps(
            self.erp_workflow.execute(str(action), payload),
            ensure_ascii=False,
            default=str,
        )
