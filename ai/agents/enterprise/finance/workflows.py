from typing import Any

from .tools import FinanceTools


class FinanceWorkflow:
    def __init__(self, tools: FinanceTools | None = None) -> None:
        self.tools = tools or FinanceTools()
        self.handlers = {
            "create_budget": self.tools.create_budget,
            "submit_expense": self.tools.submit_expense,
            "decide_expense": self.tools.decide_expense,
            "create_invoice": self.tools.create_invoice,
            "decide_invoice": self.tools.decide_invoice,
            "record_payment": self.tools.record_payment,
            "get_budget": self.tools.get_budget,
            "get_invoice": self.tools.get_invoice,
            "list_transactions": self.tools.list_transactions,
        }

    def execute(self, action: str, payload: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(action, str) or action not in self.handlers:
            raise ValueError(f"Unsupported finance action: {action}")
        if not isinstance(payload, dict):
            raise ValueError("Payload must be an object")
        return {
            "domain": "finance",
            "action": action,
            "result": self.handlers[action](payload),
        }
