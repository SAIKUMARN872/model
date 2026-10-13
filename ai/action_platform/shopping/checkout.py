"""Approval-gated checkout preparation for ModelNow shopping."""

from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal
from threading import RLock
from typing import Any, Callable
from uuid import uuid4

from .cart import ShoppingCart


@dataclass(frozen=True)
class Checkout:
    checkout_id: str
    cart_id: str
    items: tuple[dict[str, Any], ...]
    subtotal: Decimal
    currency: str
    shipping_cost: Decimal
    total: Decimal
    created_at: datetime
    approved: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "checkout_id": self.checkout_id,
            "cart_id": self.cart_id,
            "items": [dict(item) for item in self.items],
            "subtotal": format(self.subtotal, "f"),
            "currency": self.currency,
            "shipping_cost": format(self.shipping_cost, "f"),
            "total": format(self.total, "f"),
            "created_at": self.created_at.isoformat(),
            "approved": self.approved,
            "status": "awaiting_approval" if not self.approved else "approved",
        }


@dataclass(frozen=True)
class CheckoutSubmission:
    checkout_id: str
    submitted: bool
    provider_reference: str | None = None
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "checkout_id": self.checkout_id,
            "submitted": self.submitted,
            "provider_reference": self.provider_reference,
            "error": self.error,
        }


CheckoutHandler = Callable[[Checkout], dict[str, Any]]


class CheckoutManager:
    """Prepare checkout summaries and submit only explicitly approved checkouts.

    This manager does not connect to a retailer by itself. A registered
    handler must implement the retailer integration and its own idempotency.
    """

    def __init__(self) -> None:
        self._checkouts: dict[str, Checkout] = {}
        self._submissions: dict[str, CheckoutSubmission] = {}
        self._handlers: dict[str, CheckoutHandler] = {}
        self._lock = RLock()

    def prepare(
        self,
        cart: ShoppingCart,
        *,
        shipping_cost: Decimal | str | int = Decimal("0"),
    ) -> Checkout:
        if not isinstance(cart, ShoppingCart):
            raise TypeError("cart must be a ShoppingCart.")

        try:
            shipping = Decimal(str(shipping_cost))
        except Exception:
            raise ValueError("shipping_cost must be a valid decimal.") from None

        if not shipping.is_finite() or shipping < 0:
            raise ValueError("shipping_cost must be finite and non-negative.")

        snapshot = cart.snapshot()
        if not snapshot.items:
            raise ValueError("Cannot checkout an empty cart.")

        checkout = Checkout(
            checkout_id=str(uuid4()),
            cart_id=snapshot.cart_id,
            items=tuple(item.to_dict() for item in snapshot.items),
            subtotal=snapshot.subtotal,
            currency=snapshot.currency or "INR",
            shipping_cost=shipping,
            total=snapshot.subtotal + shipping,
            created_at=datetime.now(timezone.utc),
        )

        with self._lock:
            self._checkouts[checkout.checkout_id] = checkout

        return checkout

    def approve(self, checkout_id: str, *, approver_id: str) -> Checkout:
        if not isinstance(approver_id, str) or not approver_id.strip():
            raise ValueError("An explicit approver_id is required.")

        with self._lock:
            checkout = self._checkouts.get(checkout_id)
            if checkout is None:
                raise KeyError("Checkout not found.")
            if checkout_id in self._submissions:
                raise ValueError("Checkout submission has already been attempted.")

            approved = Checkout(
                checkout_id=checkout.checkout_id,
                cart_id=checkout.cart_id,
                items=checkout.items,
                subtotal=checkout.subtotal,
                currency=checkout.currency,
                shipping_cost=checkout.shipping_cost,
                total=checkout.total,
                created_at=checkout.created_at,
                approved=True,
            )
            self._checkouts[checkout_id] = approved
            return approved

    def register_handler(
        self,
        retailer: str,
        handler: CheckoutHandler,
    ) -> None:
        if not isinstance(retailer, str) or not retailer.strip():
            raise ValueError("retailer must not be empty.")
        if not callable(handler):
            raise TypeError("handler must be callable.")

        key = retailer.strip().lower()
        with self._lock:
            if key in self._handlers:
                raise ValueError(f"Handler already registered for {key}.")
            self._handlers[key] = handler

    def submit(self, checkout_id: str, *, retailer: str) -> CheckoutSubmission:
        """Submit a checkout to a registered retailer handler after approval."""
        if not isinstance(retailer, str) or not retailer.strip():
            raise ValueError("retailer must not be empty.")

        key = retailer.strip().lower()
        with self._lock:
            checkout = self._checkouts.get(checkout_id)
            if checkout is None:
                return CheckoutSubmission(
                    checkout_id=checkout_id,
                    submitted=False,
                    error="Checkout not found.",
                )

            if not checkout.approved:
                return CheckoutSubmission(
                    checkout_id=checkout_id,
                    submitted=False,
                    error="Explicit checkout approval is required.",
                )

            previous = self._submissions.get(checkout_id)
            if previous is not None:
                if previous.error == "Submission outcome is being resolved.":
                    return CheckoutSubmission(
                        checkout_id=checkout_id,
                        submitted=False,
                        error="Submission is already in progress; do not retry.",
                    )
                return CheckoutSubmission(
                    checkout_id=checkout_id,
                    submitted=False,
                    provider_reference=previous.provider_reference,
                    error="Checkout submission has already been attempted; reconcile with the retailer.",
                )

            handler = self._handlers.get(key)
            if handler is None:
                return CheckoutSubmission(
                    checkout_id=checkout_id,
                    submitted=False,
                    error="No handler registered for this retailer.",
                )

            # Reserve the attempt before calling external code so repeated
            # calls in this process cannot submit the same checkout twice.
            pending = CheckoutSubmission(
                checkout_id=checkout_id,
                submitted=False,
                error="Submission outcome is being resolved.",
            )
            self._submissions[checkout_id] = pending

        try:
            response = handler(checkout)
            if not isinstance(response, dict):
                result = CheckoutSubmission(
                    checkout_id=checkout_id,
                    submitted=False,
                    error="Invalid retailer response; reconcile before retrying.",
                )
            else:
                reference = response.get("provider_reference")
                status = response.get("status")
                if status == "submitted" and isinstance(reference, str) and reference.strip():
                    result = CheckoutSubmission(
                        checkout_id=checkout_id,
                        submitted=True,
                        provider_reference=reference,
                    )
                else:
                    result = CheckoutSubmission(
                        checkout_id=checkout_id,
                        submitted=False,
                        provider_reference=reference if isinstance(reference, str) else None,
                        error="Retailer did not confirm submission; reconcile before retrying.",
                    )
        except Exception:
            result = CheckoutSubmission(
                checkout_id=checkout_id,
                submitted=False,
                error="Submission outcome is unknown; reconcile with the retailer before retrying.",
            )

        with self._lock:
            self._submissions[checkout_id] = result
            return result

    def get(self, checkout_id: str) -> Checkout | None:
        with self._lock:
            return self._checkouts.get(checkout_id)
