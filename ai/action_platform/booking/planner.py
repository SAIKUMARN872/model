"""Provider-independent planning for ModelNow booking actions."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class BookingPlan:
    """A validated plan; creating it does not make a reservation."""

    task_id: str
    goal: str
    details: dict[str, Any] = field(default_factory=dict)
    steps: tuple[str, ...] = (
        "validate_request",
        "search_availability",
        "present_options",
        "request_user_approval",
        "submit_booking_after_approval",
        "verify_provider_confirmation",
    )
    requires_approval: bool = True

    def to_dict(self) -> dict[str, Any]:
        return {
            "task_id": self.task_id,
            "goal": self.goal,
            "details": dict(self.details),
            "steps": list(self.steps),
            "requires_approval": self.requires_approval,
        }


class BookingPlanner:
    """Builds safe booking plans without contacting external providers."""

    @staticmethod
    def _read_request(request: Any) -> tuple[str, str, dict[str, Any]]:
        if isinstance(request, dict):
            task_id = request.get("task_id", "")
            goal = request.get("goal", "")
            payload = request.get("payload", {})
            metadata = request.get("metadata", {})
        else:
            task_id = getattr(request, "task_id", "")
            goal = getattr(request, "goal", "")
            payload = getattr(request, "payload", {})
            metadata = getattr(request, "metadata", {})

        if not isinstance(task_id, str):
            raise TypeError("task_id must be a string.")
        if not isinstance(goal, str) or not goal.strip():
            raise ValueError("A non-empty booking goal is required.")
        if len(goal) > 10000:
            raise ValueError("Booking goal must not exceed 10000 characters.")
        if not isinstance(payload, dict):
            raise TypeError("Booking payload must be a dictionary.")
        if not isinstance(metadata, dict):
            raise TypeError("Booking metadata must be a dictionary.")

        details = dict(payload)
        details.pop("approved", None)
        details.pop("is_approved", None)
        details.pop("requires_approval", None)

        return task_id.strip(), goal.strip(), details

    def plan(self, request: Any) -> BookingPlan:
        """Validate a request and return a plan requiring explicit approval."""
        task_id, goal, details = self._read_request(request)
        return BookingPlan(
            task_id=task_id,
            goal=goal,
            details=details,
        )

    def create_plan(self, request: Any) -> BookingPlan:
        """Alias for plan(), for callers that prefer an explicit method name."""
        return self.plan(request)
