from __future__ import annotations

import inspect
from typing import Any

from ai.action_platform.core.action import ActionStatus
from ai.action_platform.core.models import ActionRequest, ActionResult
from ai.action_platform.exceptions import (
    ActionExecutionError,
    ActionHandlerNotFoundError,
)
from ai.action_platform.permissions import require_domain_permission
from ai.action_platform.registry import ActionRegistry
from ai.action_platform.core.schemas import validate_request
from ai.action_platform.utils import new_action_id


APPROVAL_OPERATIONS = {
    "checkout",
    "pay",
    "payment",
    "purchase",
    "place_order",
    "submit_order",
    "confirm_order",
    "book",
    "confirm_booking",
    "cancel_booking",
    "submit_booking",
    "refund",
    "issue_refund",
    "transfer",
    "transfer_funds",
    "withdraw",
    "send_money",
    "subscribe",
    "create_subscription",
    "cancel_subscription",
    "delete",
    "delete_account",
    "remove_account",
    "send",
    "publish",
    "submit",
}


def action_requires_approval(request: ActionRequest) -> bool:
    """Check explicit approval requirements for consequential operations."""
    if request.payload.get("requires_approval") is True:
        return True

    operation = request.payload.get("operation", "")
    if not isinstance(operation, str):
        return False

    return operation.strip().lower().replace("-", "_").replace(" ", "_") in (
        APPROVAL_OPERATIONS
    )


class ActionRouter:
    def __init__(self, registry: ActionRegistry) -> None:
        self.registry = registry

    async def execute(
        self,
        request: ActionRequest,
        context: Any = None,
    ) -> ActionResult:
        validate_request(request)

        if not request.task_id:
            request.task_id = new_action_id()

        require_domain_permission(request, context)

        if action_requires_approval(request):
            approved_actions = getattr(context, "approved_actions", set())
            if request.task_id not in approved_actions:
                return ActionResult(
                    task_id=request.task_id,
                    domain=request.domain,
                    status=ActionStatus.AWAITING_APPROVAL,
                    goal=request.goal,
                    data={
                        "approval_required": True,
                        "operation": request.payload.get("operation"),
                        "message": (
                            "Explicit approval is required before this "
                            "consequential action can execute."
                        ),
                    },
                )

        handler = self.registry.get(request.domain)
        if handler is None:
            raise ActionHandlerNotFoundError(
                f"No handler registered for domain: {request.domain.value}"
            )

        try:
            output = handler.execute(request, context)
            if inspect.isawaitable(output):
                output = await output

            if isinstance(output, ActionResult):
                output.task_id = request.task_id
                return output

            if not isinstance(output, dict):
                output = {"value": output}

            result_data = dict(output)
            status_value = result_data.pop(
                "status", ActionStatus.COMPLETED.value
            )
            status = (
                status_value
                if isinstance(status_value, ActionStatus)
                else ActionStatus(status_value)
            )

            return ActionResult(
                task_id=request.task_id,
                domain=request.domain,
                status=status,
                goal=request.goal,
                data=result_data,
            )
        except ActionExecutionError:
            raise
        except Exception as exc:
            raise ActionExecutionError(
                f"Action execution failed for task {request.task_id}: {exc}"
            ) from exc

