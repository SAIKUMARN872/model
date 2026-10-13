import json
from typing import Any

from ..enterprise import EnterpriseAgent
from ..constants import EnterpriseDomain
from .tools import CustomTools
from .workflows import CustomWorkflow


class CustomEnterpriseAgent(EnterpriseAgent):
    def __init__(
        self,
        agent_id: str = "custom-enterprise-agent",
        name: str = "Custom Enterprise Agent",
        tools: CustomTools | None = None,
    ):
        super().__init__(
            agent_id=agent_id,
            domain=EnterpriseDomain.CUSTOM,
            name=name,
        )
        self.tools = tools or CustomTools()
        self.workflow = CustomWorkflow(self.tools)

    async def run_task(self, task: Any) -> str:
        if isinstance(task, dict):
            action = task.get("action")
            payload = task.get("payload", {})
        else:
            action = getattr(task, "action", None)
            payload = getattr(task, "payload", {})
            metadata = getattr(task, "metadata", {})
            if not action and isinstance(metadata, dict):
                action = metadata.get("action")
            if not payload and isinstance(metadata, dict):
                payload = metadata.get("payload", {})

        if not isinstance(action, str) or not action.strip():
            raise ValueError("Custom enterprise task requires an action")
        if not isinstance(payload, dict):
            raise ValueError("Custom enterprise task payload must be a dictionary")

        result = self.workflow.execute(action, payload)
        return json.dumps(result, default=str)
