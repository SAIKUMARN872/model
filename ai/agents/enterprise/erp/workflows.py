from typing import Any

from .tools import ERPTools


class ERPWorkflow:
    def __init__(self, tools: ERPTools | None = None) -> None:
        self.tools = tools or ERPTools()
        self.handlers = {
            "add_supplier": self.tools.add_supplier,
            "create_item": self.tools.create_item,
            "get_item": self.tools.get_item,
            "list_items": self.tools.list_items,
            "create_requisition": self.tools.create_requisition,
            "approve_requisition": self.tools.approve_requisition,
            "create_purchase_order": self.tools.create_purchase_order,
            "approve_purchase_order": self.tools.approve_purchase_order,
            "receive_goods": self.tools.receive_goods,
            "move_stock": self.tools.move_stock,
        }

    def execute(self, action: str, payload: dict[str, Any]) -> dict[str, Any]:
        if action not in self.handlers:
            raise ValueError(f"Unsupported ERP action: {action}")
        if not isinstance(payload, dict):
            raise ValueError("Payload must be an object")
        return {
            "domain": "erp",
            "action": action,
            "result": self.handlers[action](payload),
        }
