"""Order preparation and lifecycle tracking for ModelNow commerce."""

from dataclasses import dataclass, field
from typing import Any


@dataclass
class CommerceOrder:
    task_id: str
    order_id: str | None
    status: str
    items: list[dict[str, Any]]
    currency: str
    amount: str | None = None
    merchant: str | None = None
    requires_approval: bool = True
    provider_confirmation_id: str | None = None
    history: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "task_id": self.task_id,
            "order_id": self.order_id,
            "status": self.status,
            "items": [dict(item) for item in self.items],
            "currency": self.currency,
            "amount": self.amount,
            "merchant": self.merchant,
            "requires_approval": self.requires_approval,
            "provider_confirmation_id": self.provider_confirmation_id,
            "history": list(self.history),
        }


class OrderManager:
    """Prepare orders and validate externally reported order transitions."""

    TERMINAL_STATUSES = {"confirmed", "failed", "cancelled"}
    ALLOWED_STATUSES = {
        "awaiting_approval",
        "submitted",
        "pending",
        "confirmed",
        "failed",
        "cancelled",
    }

    def prepare(self, plan: dict[str, Any]) -> CommerceOrder:
        if not isinstance(plan, dict):
            raise ValueError("Order plan must be a dictionary.")

        task_id = plan.get("task_id")
        if not isinstance(task_id, str) or not task_id.strip():
            raise ValueError("A non-empty task_id is required.")

        items = plan.get("items", [])
        if not isinstance(items, list):
            raise ValueError("Order items must be a list.")

        currency = plan.get("currency", "INR")
        if not isinstance(currency, str) or not currency.strip():
            raise ValueError("A valid currency is required.")

        amount = plan.get("amount")
        if amount is not None and (
            not isinstance(amount, str) or not amount.strip()
        ):
            raise ValueError("Amount must be a non-empty string when supplied.")

        merchant = plan.get("merchant")
        if merchant is not None and (
            not isinstance(merchant, str) or not merchant.strip()
        ):
            raise ValueError("Merchant must be a non-empty string.")

        if plan.get("requires_approval") is not True:
            raise ValueError(
                "Commerce orders must require explicit user approval."
            )

        for index, item in enumerate(items):
            if not isinstance(item, dict):
                raise ValueError(f"Order item {index} must be a dictionary.")
            product_id = item.get("product_id")
            quantity = item.get("quantity")
            if not isinstance(product_id, str) or not product_id.strip():
                raise ValueError(f"Order item {index} requires a product_id.")
            if (
                isinstance(quantity, bool)
                or not isinstance(quantity, int)
                or quantity <= 0
            ):
                raise ValueError(
                    f"Order item {index} quantity must be a positive integer."
                )

        return CommerceOrder(
            task_id=task_id.strip(),
            order_id=None,
            status="awaiting_approval",
            items=[dict(item) for item in items],
            currency=currency.strip().upper(),
            amount=amount,
            merchant=merchant.strip() if isinstance(merchant, str) else None,
            requires_approval=True,
            history=["awaiting_approval"],
        )

    def record_provider_status(
        self,
        order: CommerceOrder,
        status: str,
        provider_confirmation_id: str | None = None,
    ) -> CommerceOrder:
        """Record a provider-reported status; callers must verify its source."""

        if not isinstance(order, CommerceOrder):
            raise ValueError("A CommerceOrder instance is required.")

        if not isinstance(status, str):
            raise ValueError("Order status must be a string.")

        status = status.strip().lower()
        if status not in self.ALLOWED_STATUSES:
            raise ValueError(f"Unsupported order status: {status}")

        if order.status in self.TERMINAL_STATUSES:
            raise ValueError(
                f"Cannot transition an order from terminal status {order.status}."
            )

        if status == "confirmed":
            if (
                not isinstance(provider_confirmation_id, str)
                or not provider_confirmation_id.strip()
            ):
                raise ValueError(
                    "A provider confirmation ID is required to confirm an order."
                )

        order.status = status
        order.history.append(status)

        if provider_confirmation_id is not None:
            order.provider_confirmation_id = provider_confirmation_id.strip()

        if status == "confirmed":
            order.order_id = order.provider_confirmation_id

        return order
