from typing import Any

from .tools import SalesTools


class SalesWorkflow:
    def __init__(self, tools: SalesTools | None = None) -> None:
        self.tools = tools or SalesTools()
        self.handlers = {
            "add_product": self.tools.add_product,
            "list_products": self.tools.list_products,
            "create_quote": self.tools.create_quote,
            "decide_quote": self.tools.decide_quote,
            "create_order": self.tools.create_order,
            "get_quote": self.tools.get_quote,
            "pipeline_summary": self.tools.pipeline_summary,
        }

    def execute(self, action: str, payload: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(action, str) or action not in self.handlers:
            raise ValueError(f"Unsupported sales action: {action}")
        if not isinstance(payload, dict):
            raise ValueError("Payload must be an object")
        return {
            "domain": "sales",
            "action": action,
            "result": self.handlers[action](payload),
        }
