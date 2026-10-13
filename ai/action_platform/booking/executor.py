"""Safe asynchronous execution for ModelNow booking actions."""

from __future__ import annotations

import inspect
from typing import Any

from ..core.context import ActionContext
from .booking import BookingRequest, BookingResult
from .planner import BookingPlanner


class BookingExecutor:
    """Executes bookings through an explicitly configured provider."""

    def __init__(self, provider: Any = None, planner: BookingPlanner | None = None):
        self.provider = provider
        self.planner = planner or BookingPlanner()

    async def execute(
        self,
        request: BookingRequest | dict[str, Any],
        context: ActionContext | None = None,
    ) -> BookingResult:
        plan = self.planner.plan(request)

        if context is None or not context.user_id:
            return BookingResult(
                task_id=plan.task_id,
                status="denied",
                goal=plan.goal,
                plan=plan.to_dict(),
                error="A trusted execution context with user_id is required.",
            )

        if not context.has_permission("action:booking"):
            return BookingResult(
                task_id=plan.task_id,
                status="denied",
                goal=plan.goal,
                plan=plan.to_dict(),
                error="Missing permission: action:booking.",
            )

        if not context.has_approval(plan.task_id):
            return BookingResult(
                task_id=plan.task_id,
                status="awaiting_approval",
                goal=plan.goal,
                plan=plan.to_dict(),
            )

        if self.provider is None:
            return BookingResult(
                task_id=plan.task_id,
                status="not_executed",
                goal=plan.goal,
                plan=plan.to_dict(),
                error="No booking provider is configured.",
            )

        create_booking = getattr(self.provider, "create_booking", None)
        if not callable(create_booking):
            return BookingResult(
                task_id=plan.task_id,
                status="failed",
                goal=plan.goal,
                plan=plan.to_dict(),
                error="Provider must implement create_booking(plan).",
            )

        try:
            response = create_booking(plan.to_dict())
            if inspect.isawaitable(response):
                response = await response

            if not isinstance(response, dict):
                return BookingResult(
                    task_id=plan.task_id,
                    status="failed",
                    goal=plan.goal,
                    plan=plan.to_dict(),
                    error="Provider returned an invalid response.",
                )

            confirmation_id = response.get("provider_confirmation_id")
            if not isinstance(confirmation_id, str) or not confirmation_id.strip():
                return BookingResult(
                    task_id=plan.task_id,
                    status="unverified",
                    goal=plan.goal,
                    plan=plan.to_dict(),
                    error=(
                        "Provider response did not include a verified "
                        "provider_confirmation_id."
                    ),
                )

            confirmation = {
                "provider_confirmation_id": confirmation_id.strip(),
                "provider": str(response.get("provider", type(self.provider).__name__)),
            }

            return BookingResult(
                task_id=plan.task_id,
                status="confirmed",
                goal=plan.goal,
                plan=plan.to_dict(),
                confirmation=confirmation,
            )

        except Exception:
            return BookingResult(
                task_id=plan.task_id,
                status="failed",
                goal=plan.goal,
                plan=plan.to_dict(),
                error="Booking provider execution failed.",
            )
