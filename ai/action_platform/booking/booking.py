"""Booking request and orchestration models for ModelNow."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .planner import BookingPlan, BookingPlanner


@dataclass
class BookingRequest:
    """Normalized input for a booking workflow."""

    task_id: str
    goal: str
    payload: dict[str, Any] = field(default_factory=dict)
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not isinstance(self.task_id, str):
            raise TypeError("task_id must be a string.")
        if not self.task_id.strip():
            raise ValueError("task_id must not be empty.")
        if not isinstance(self.goal, str) or not self.goal.strip():
            raise ValueError("goal must not be empty.")
        if len(self.goal) > 10000:
            raise ValueError("goal must not exceed 10000 characters.")
        if not isinstance(self.payload, dict):
            raise TypeError("payload must be a dictionary.")
        if not isinstance(self.metadata, dict):
            raise TypeError("metadata must be a dictionary.")

        self.task_id = self.task_id.strip()
        self.goal = self.goal.strip()


@dataclass
class BookingResult:
    """Result of planning or executing a booking workflow."""

    task_id: str
    status: str
    goal: str
    plan: dict[str, Any] = field(default_factory=dict)
    confirmation: dict[str, Any] = field(default_factory=dict)
    error: str | None = None

    @property
    def confirmed(self) -> bool:
        """True only when a provider-confirmed result is recorded."""
        return self.status == "confirmed" and bool(
            self.confirmation.get("provider_confirmation_id")
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "task_id": self.task_id,
            "status": self.status,
            "goal": self.goal,
            "plan": dict(self.plan),
            "confirmation": dict(self.confirmation),
            "confirmed": self.confirmed,
            "error": self.error,
        }


class BookingCoordinator:
    """Coordinates booking planning without inventing provider results."""

    def __init__(self, planner: BookingPlanner | None = None) -> None:
        self.planner = planner or BookingPlanner()

    def prepare(self, request: BookingRequest | dict[str, Any]) -> BookingResult:
        """Prepare a booking and leave it awaiting approval."""
        plan: BookingPlan = self.planner.plan(request)
        return BookingResult(
            task_id=plan.task_id,
            status="awaiting_approval",
            goal=plan.goal,
            plan=plan.to_dict(),
        )

    def execute(
        self,
        request: BookingRequest | dict[str, Any],
        *,
        approved: bool = False,
        provider: Any = None,
    ) -> BookingResult:
        """Execute only through an explicitly supplied provider after approval.

        The provider must expose an async create_booking(plan) method.
        This method deliberately does not treat request payload flags as
        trusted approval and does not simulate a successful reservation.
        """
        plan = self.planner.plan(request)

        if not approved:
            return BookingResult(
                task_id=plan.task_id,
                status="awaiting_approval",
                goal=plan.goal,
                plan=plan.to_dict(),
            )

        if provider is None:
            return BookingResult(
                task_id=plan.task_id,
                status="not_executed",
                goal=plan.goal,
                plan=plan.to_dict(),
                error="No booking provider is configured.",
            )

        create_booking = getattr(provider, "create_booking", None)
        if not callable(create_booking):
            return BookingResult(
                task_id=plan.task_id,
                status="failed",
                goal=plan.goal,
                plan=plan.to_dict(),
                error="Booking provider must implement create_booking(plan).",
            )

        return BookingResult(
            task_id=plan.task_id,
            status="provider_required",
            goal=plan.goal,
            plan=plan.to_dict(),
            error=(
                "Provider execution is asynchronous. Use the booking executor "
                "to await the provider response and verify confirmation."
            ),
        )
