"""Checkout request validation and preparation for ModelNow."""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation
from typing import Any


@dataclass(frozen=True)
class CheckoutPlan:
    """Validated checkout details; creating a plan does not place an order."""

    task_id: str
    goal: str
    items: tuple[dict[str, Any], ...] = ()
    amount: str | None = None
    currency: str = "INR"
    merchant: str | None = None
    requires_approval: bool = True
    steps: tuple[str, ...] = (
        "validate_cart",
        "calculate_or_verify_total",
        "present_order_summary",
        "request_user_approval",
        "submit_checkout_after_approval",
        "verify_order_confirmation",
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "task_id": self.task_id,
            "goal": self.goal,
            "items": [dict(item) for item in self.items],
            "amount": self.amount,
            "currency": self.currency,
            "merchant": self.merchant,
            "requires_approval": self.requires_approval,
            "steps": list(self.steps),
        }


@dataclass
class CheckoutResult:
    """Outcome of preparing a checkout, not proof of a completed purchase."""

    task_id: str
    status: str
    plan: dict[str, Any] = field(default_factory=dict)
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "task_id": self.task_id,
            "status": self.status,
            "plan": dict(self.plan),
            "error": self.error,
        }


class CheckoutCoordinator:
    """Validates checkout details and prepares a user-reviewable plan."""

    ALLOWED_CURRENCIES = {
        "INR", "USD", "EUR", "GBP", "AUD", "CAD", "SGD", "JPY",
    }

    @staticmethod
    def _read_request(request: Any) -> tuple[str, str, dict[str, Any]]:
        if isinstance(request, dict):
            task_id = request.get("task_id", "")
            goal = request.get("goal", "")
            payload = request.get("payload", {})
        else:
            task_id = getattr(request, "task_id", "")
            goal = getattr(request, "goal", "")
            payload = getattr(request, "payload", {})

        if not isinstance(task_id, str) or not task_id.strip():
            raise ValueError("A non-empty task_id is required.")
        if not isinstance(goal, str) or not goal.strip():
            raise ValueError("A non-empty checkout goal is required.")
        if len(goal) > 10000:
            raise ValueError("Checkout goal must not exceed 10000 characters.")
        if not isinstance(payload, dict):
            raise TypeError("Checkout payload must be a dictionary.")

        return task_id.strip(), goal.strip(), dict(payload)

    @staticmethod
    def _normalize_amount(value: Any) -> str | None:
        if value is None:
            return None
        if isinstance(value, bool):
            raise ValueError("Checkout amount must be a valid positive number.")

        try:
            amount = Decimal(str(value))
        except (InvalidOperation, ValueError):
            raise ValueError("Checkout amount must be a valid decimal number.") from None

        if not amount.is_finite() or amount <= 0:
            raise ValueError("Checkout amount must be greater than zero.")

        return format(amount.quantize(Decimal("0.01")), ".2f")

    def prepare(self, request: Any) -> CheckoutPlan:
        """Validate checkout details and produce a plan requiring approval."""
        task_id, goal, payload = self._read_request(request)

        raw_items = payload.get("items", [])
        if not isinstance(raw_items, list):
            raise TypeError("Checkout items must be a list.")

        items: list[dict[str, Any]] = []
        for index, item in enumerate(raw_items):
            if not isinstance(item, dict):
                raise TypeError(f"Checkout item {index} must be a dictionary.")

            quantity = item.get("quantity", 1)
            if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1:
                raise ValueError(
                    f"Checkout item {index} quantity must be a positive integer."
                )

            normalized_item = dict(item)
            normalized_item["quantity"] = quantity
            items.append(normalized_item)

        amount = self._normalize_amount(payload.get("amount"))

        currency = payload.get("currency", "INR")
        if not isinstance(currency, str):
            raise ValueError("Currency must be a string.")
        currency = currency.strip().upper()
        if currency not in self.ALLOWED_CURRENCIES:
            raise ValueError(f"Unsupported checkout currency: {currency!r}.")

        merchant = payload.get("merchant")
        if merchant is not None:
            if not isinstance(merchant, str) or not merchant.strip():
                raise ValueError("Merchant must be a non-empty string when supplied.")
            merchant = merchant.strip()

        return CheckoutPlan(
            task_id=task_id,
            goal=goal,
            items=tuple(items),
            amount=amount,
            currency=currency,
            merchant=merchant,
        )

    def prepare_result(self, request: Any) -> CheckoutResult:
        """Return a standard result suitable for the action platform."""
        plan = self.prepare(request)
        return CheckoutResult(
            task_id=plan.task_id,
            status="awaiting_approval",
            plan=plan.to_dict(),
        )
