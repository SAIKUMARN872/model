import json
from typing import Any

from ai.agents.enterprise.constants import EnterpriseDomain
from ai.agents.enterprise.enterprise import EnterpriseAgent

from .tools import FinanceTools
from .workflows import FinanceWorkflow


class FinanceAgent(EnterpriseAgent):
    def __init__(
        self,
        agent_id: str = "finance-agent",
        name: str = "Finance Agent",
        tools: FinanceTools | None = None,
        workflow: FinanceWorkflow | None = None,
    ) -> None:
        self.finance_workflow = workflow or FinanceWorkflow(tools=tools)
        super().__init__(
            agent_id=agent_id,
            domain=EnterpriseDomain.FINANCE,
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
            raise ValueError("Finance task requires an action")
        return json.dumps(
            self.finance_workflow.execute(str(action), payload),
            ensure_ascii=False,
            default=str,
        )
