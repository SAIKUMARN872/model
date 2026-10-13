from __future__ import annotations

from typing import Any

from .tools import BusinessSupportTools


class BusinessSupportWorkflow:
    def __init__(self, tools: BusinessSupportTools | None = None) -> None:
        self.tools = tools or BusinessSupportTools()
        self._handlers = {
            "create_ticket": self.tools.create_ticket,
            "assign_ticket": self.tools.assign_ticket,
            "update_status": self.tools.update_status,
            "draft_response": self.tools.draft_response,
            "escalate_ticket": self.tools.escalate_ticket,
            "resolve_ticket": self.tools.resolve_ticket,
            "get_ticket": self.tools.get_ticket,
        }

    def execute(self, action: str, payload: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(action, str) or action not in self._handlers:
            raise ValueError(f"Unsupported business support action: {action}")
        if not isinstance(payload, dict):
            raise ValueError("Payload must be an object")
        result = self._handlers[action](payload)
        return {
            "domain": "business_support",
            "action": action,
            "result": result,
        }
