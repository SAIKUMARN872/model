import json
from typing import Any

from ai.agents.enterprise.constants import EnterpriseDomain
from ai.agents.enterprise.enterprise import EnterpriseAgent

from .tools import SalesTools
from .workflows import SalesWorkflow


class SalesAgent(EnterpriseAgent):
    def __init__(
        self,
        agent_id: str = "sales-agent",
        name: str = "Sales Agent",
        tools: SalesTools | None = None,
        workflow: SalesWorkflow | None = None,
    ) -> None:
        self.sales_workflow = workflow or SalesWorkflow(tools=tools)
        super().__init__(
            agent_id=agent_id,
            domain=EnterpriseDomain.SALES,
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
            raise ValueError("Sales task requires an action")
        return json.dumps(
            self.sales_workflow.execute(str(action), payload),
            ensure_ascii=False,
            default=str,
        )
