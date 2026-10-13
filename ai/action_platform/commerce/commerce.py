"""Core commerce planning and result models for ModelNow."""

from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation
from typing import Any


@dataclass(frozen=True)
class CommercePlan:
    task_id: str
    goal: str
    operation: str
    items: tuple[dict[str, Any], ...] = ()
    amount: str | None = None
    currency: str = "INR"
    merchant: str | None = None
    requires_approval: bool = True

    def to_dict(self) -> dict[str, Any]:
        return {
            "task_id": self.task_id,
            "goal": self.goal,
            "operation": self.operation,
            "items": [dict(item) for item in self.items],
            "amount": self.amount,
            "currency": self.currency,
            "merchant": self.merchant,
            "requires_approval": self.requires_approval,
        }


@dataclass
class CommerceResult:
    task_id: str
    status: str
    plan: dict[str, Any] | None = None
    data: dict[str, Any] = field(default_factory=dict)
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "task_id": self.task_id,
            "status": self.status,
            "plan": self.plan,
            "data": dict(self.data),
            "error": self.error,
        }


class CommerceCoordinator:
    """Prepare validated commerce plans; do not execute purchases."""

    SUPPORTED_CURRENCIES = {
        "INR", "USD", "EUR", "GBP", "AUD", "CAD", "SGD", "JPY"
    }
    SUPPORTED_OPERATIONS = {
        "add_to_cart", "remove_from_cart", "update_cart",
        "view_cart", "checkout", "place_order", "cancel_order",
    }

    def prepare(self, request: dict[str, Any]) -> CommercePlan:
        if not isinstance(request, dict):
            raise ValueError("Commerce request must be a dictionary.")

        task_id = request.get("task_id")
        goal = request.get("goal")
        operation = request.get("operation", "checkout")
        payload = request.get("payload", {})

        if not isinstance(task_id, str) or not task_id.strip():
            raise ValueError("A non-empty task_id is required.")
        if not isinstance(goal, str) or not goal.strip():
            raise ValueError("A non-empty goal is required.")
        if not isinstance(operation, str):
            raise ValueError("Operation must be a string.")
        if not isinstance(payload, dict):
            raise ValueError("Commerce payload must be a dictionary.")

        operation = operation.strip().lower()
        if operation not in self.SUPPORTED_OPERATIONS:
            raise ValueError(f"Unsupported commerce operation: {operation}")

        raw_items = payload.get("items", [])
        if not isinstance(raw_items, list):
            raise ValueError("Items must be provided as a list.")

        items = []
        for index, item in enumerate(raw_items):
            if not isinstance(item, dict):
                raise ValueError(f"Item {index} must be a dictionary.")

            product_id = item.get("product_id")
            quantity = item.get("quantity", 1)

            if not isinstance(product_id, str) or not product_id.strip():
                raise ValueError(
                    f"Item {index} requires a non-empty product_id."
                )
            if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity <= 0:
                raise ValueError(
                    f"Item {index} quantity must be a positive integer."
                )

            items.append({
                **item,
                "product_id": product_id.strip(),
                "quantity": quantity,
            })

        currency = payload.get("currency", "INR")
        if not isinstance(currency, str):
            raise ValueError("Currency must be a string.")
        currency = currency.strip().upper()
        if currency not in self.SUPPORTED_CURRENCIES:
            raise ValueError(f"Unsupported currency: {currency}")

        amount = None
        if payload.get("amount") is not None:
            try:
                parsed_amount = Decimal(str(payload["amount"]))
            except (InvalidOperation, ValueError):
                raise ValueError("Amount must be a valid decimal number.") from None

            if not parsed_amount.is_finite() or parsed_amount <= 0:
                raise ValueError("Amount must be greater than zero.")

            amount = (
                f"{parsed_amount:.0f}"
                if currency == "JPY"
                else f"{parsed_amount:.2f}"
            )

        merchant = payload.get("merchant")
        if merchant is not None:
            if not isinstance(merchant, str) or not merchant.strip():
                raise ValueError("Merchant must be a non-empty string.")
            merchant = merchant.strip()

        return CommercePlan(
            task_id=task_id.strip(),
            goal=goal.strip(),
            operation=operation,
            items=tuple(items),
            amount=amount,
            currency=currency,
            merchant=merchant,
            requires_approval=True,
        )

    def prepare_result(self, request: dict[str, Any]) -> CommerceResult:
        try:
            plan = self.prepare(request)
        except (ValueError, TypeError) as exc:
            task_id = request.get("task_id", "") if isinstance(request, dict) else ""
            return CommerceResult(
                task_id=task_id if isinstance(task_id, str) else "",
                status="failed",
                error=str(exc),
            )

        return CommerceResult(
            task_id=plan.task_id,
            status="awaiting_approval",
            plan=plan.to_dict(),
        )
