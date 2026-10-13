from typing import Any

from .tools import CustomTools


class CustomWorkflow:
    def __init__(self, tools: CustomTools | None = None):
        self.tools = tools or CustomTools()
        self.handlers = {
            "define_workflow": self._define_workflow,
            "create_case": self._create_case,
            "advance_case": self._advance_case,
            "decide_approval": self._decide_approval,
            "cancel_case": self._cancel_case,
            "get_case": self._get_case,
            "list_cases": self._list_cases,
        }

    def execute(
        self,
        action: str,
        payload: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        if not isinstance(action, str) or not action.strip():
            raise ValueError("action must be a non-empty string")
        if not isinstance(payload, dict) and payload is not None:
            raise ValueError("payload must be a dictionary")
        handler = self.handlers.get(action)
        if handler is None:
            raise ValueError(f"Unsupported custom workflow action: {action}")
        return {"action": action, "result": handler(payload or {})}

    def _define_workflow(self, p):
        return self.tools.define_workflow(
            p.get("name"), p.get("steps", []), p.get("requires_approval", False)
        )

    def _create_case(self, p):
        return self.tools.create_case(
            p.get("workflow_name"), p.get("title"), p.get("data")
        )

    def _advance_case(self, p):
        return self.tools.advance_case(p.get("case_id"), p.get("data"))

    def _decide_approval(self, p):
        return self.tools.decide_approval(
            p.get("case_id"), p.get("approved"), p.get("data")
        )

    def _cancel_case(self, p):
        return self.tools.cancel_case(p.get("case_id"))

    def _get_case(self, p):
        return self.tools.get_case(p.get("case_id"))

    def _list_cases(self, p):
        return self.tools.list_cases()
