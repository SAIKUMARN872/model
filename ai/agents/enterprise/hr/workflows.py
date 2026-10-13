from __future__ import annotations

from typing import Any

from .schemas import HRAction
from .tools import HRTools


class HRWorkflow:
    """Validates and dispatches HR actions to local record tools."""

    def __init__(self, tools: HRTools | None = None) -> None:
        self.tools = tools or HRTools()
        self._handlers = {
            HRAction.CREATE_EMPLOYEE: self.tools.create_employee,
            HRAction.CREATE_CANDIDATE: self.tools.create_candidate,
            HRAction.SCREEN_CANDIDATE: self.tools.screen_candidate,
            HRAction.SCHEDULE_INTERVIEW: self.tools.schedule_interview,
            HRAction.RECORD_INTERVIEW: self.tools.record_interview,
            HRAction.REQUEST_ONBOARDING: self.tools.request_onboarding,
            HRAction.APPROVE_ONBOARDING: self.tools.approve_onboarding,
            HRAction.SUBMIT_LEAVE_REQUEST: self.tools.submit_leave_request,
            HRAction.REVIEW_LEAVE_REQUEST: self.tools.review_leave_request,
            HRAction.RECORD_ATTENDANCE: self.tools.record_attendance,
            HRAction.RECORD_PERFORMANCE_REVIEW: self.tools.record_performance_review,
        }

    def execute(self, action: str, payload: dict[str, Any]) -> dict[str, Any]:
        try:
            key = HRAction(action)
        except (ValueError, TypeError):
            raise ValueError(f"Unsupported HR action: {action}") from None
        if not isinstance(payload, dict):
            raise ValueError("HR payload must be an object")
        result = self._handlers[key](payload)
        return {"domain": "hr", "action": key.value, "result": result}
