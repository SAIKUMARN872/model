"""Guarded executor for ModelNow enterprise actions."""

from dataclasses import dataclass, field
from threading import RLock
from typing import Any, Callable

from .action import (
    EnterpriseAction,
    EnterpriseActionStatus,
    EnterpriseActionType,
)
from .schemas import validate_enterprise_action


EnterpriseHandler = Callable[[EnterpriseAction], dict[str, Any]]


@dataclass
class EnterpriseActionResult:
    """Structured result of enterprise action dispatch."""

    action_id: str
    action_type: EnterpriseActionType
    operation: str
    status: EnterpriseActionStatus
    data: dict[str, Any] = field(default_factory=dict)
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "action_id": self.action_id,
            "action_type": self.action_type.value,
            "operation": self.operation,
            "status": self.status.value,
            "data": self.data,
            "error": self.error,
        }


class EnterpriseActionExecutor:
    """Dispatch validated actions through explicitly registered handlers.

    This executor does not connect to enterprise systems by itself.
    Integrations must register trusted handlers and supply trusted context.
    """

    def __init__(self) -> None:
        self._handlers: dict[
            tuple[EnterpriseActionType, str], EnterpriseHandler
        ] = {}
        self._lock = RLock()

    def register_handler(
        self,
        action_type: EnterpriseActionType,
        operation: str,
        handler: EnterpriseHandler,
    ) -> None:
        if not isinstance(action_type, EnterpriseActionType):
            raise ValueError("Unsupported enterprise action type.")
        if not isinstance(operation, str) or not operation.strip():
            raise ValueError("operation must not be empty.")
        if not callable(handler):
            raise ValueError("handler must be callable.")

        key = (action_type, operation.strip())
        with self._lock:
            if key in self._handlers:
                raise ValueError(
                    f"Handler already registered for "
                    f"{action_type.value}:{operation.strip()}."
                )
            self._handlers[key] = handler

    def execute(
        self,
        action: EnterpriseAction,
        *,
        permissions: set[str] | None = None,
        approved_action_ids: set[str] | None = None,
    ) -> EnterpriseActionResult:
        validate_enterprise_action(action)

        action_id = action.action_id.strip()
        permissions = permissions if permissions is not None else set()
        approved_action_ids = (
            approved_action_ids
            if approved_action_ids is not None
            else set()
        )

        if not isinstance(permissions, set) or not all(
            isinstance(item, str) for item in permissions
        ):
            raise ValueError("permissions must be a set of strings.")
        if not isinstance(approved_action_ids, set) or not all(
            isinstance(item, str) for item in approved_action_ids
        ):
            raise ValueError(
                "approved_action_ids must be a set of strings."
            )

        required_permission = (
            f"enterprise:{action.action_type.value}:{action.operation}"
        )
        if required_permission not in permissions:
            return EnterpriseActionResult(
                action_id=action_id,
                action_type=action.action_type,
                operation=action.operation,
                status=EnterpriseActionStatus.REJECTED,
                error="Required enterprise permission was not granted.",
            )

        if (
            action.requires_approval
            and (
                not action_id
                or action_id not in approved_action_ids
            )
        ):
            return EnterpriseActionResult(
                action_id=action_id,
                action_type=action.action_type,
                operation=action.operation,
                status=EnterpriseActionStatus.AWAITING_APPROVAL,
                error="Explicit approval is required before execution.",
            )

        key = (action.action_type, action.operation.strip())
        with self._lock:
            handler = self._handlers.get(key)

        if handler is None:
            return EnterpriseActionResult(
                action_id=action_id,
                action_type=action.action_type,
                operation=action.operation,
                status=EnterpriseActionStatus.FAILED,
                error="No handler is registered for this enterprise action.",
            )

        try:
            result = handler(action)
            if not isinstance(result, dict):
                raise TypeError(
                    "Enterprise handler must return a dictionary."
                )
        except Exception:
            return EnterpriseActionResult(
                action_id=action_id,
                action_type=action.action_type,
                operation=action.operation,
                status=EnterpriseActionStatus.FAILED,
                error="Enterprise handler failed.",
            )

        return EnterpriseActionResult(
            action_id=action_id,
            action_type=action.action_type,
            operation=action.operation,
            status=EnterpriseActionStatus.COMPLETED,
            data=result,
        )
