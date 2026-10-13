"""Food-order status verification for ModelNow."""

from dataclasses import dataclass
from enum import Enum


class FoodOrderStatus(str, Enum):
    PREPARED = "prepared"
    AWAITING_APPROVAL = "awaiting_approval"
    SUBMITTED = "submitted"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    FAILED = "failed"
    UNKNOWN = "unknown"


@dataclass(frozen=True)
class FoodOrderVerification:
    """Result of checking food-order evidence from a trusted provider."""

    order_id: str
    status: FoodOrderStatus
    verified: bool
    provider_reference: str | None = None
    message: str | None = None

    def to_dict(self) -> dict:
        return {
            "order_id": self.order_id,
            "status": self.status.value,
            "verified": self.verified,
            "provider_reference": self.provider_reference,
            "message": self.message,
        }


def verify_food_order_status(
    *,
    order_id: str,
    provider_status: str | None = None,
    provider_reference: str | None = None,
) -> FoodOrderVerification:
    """Normalize status supplied by an external provider.

    This function does not contact a provider or independently authenticate
    the evidence. Callers must obtain these values from a trusted integration.
    """
    if not isinstance(order_id, str) or not order_id.strip():
        raise ValueError("order_id must not be empty.")

    normalized = (
        provider_status.strip().lower()
        if isinstance(provider_status, str)
        else ""
    )

    status_map = {
        "prepared": FoodOrderStatus.PREPARED,
        "awaiting_approval": FoodOrderStatus.AWAITING_APPROVAL,
        "submitted": FoodOrderStatus.SUBMITTED,
        "confirmed": FoodOrderStatus.CONFIRMED,
        "accepted": FoodOrderStatus.CONFIRMED,
        "rejected": FoodOrderStatus.REJECTED,
        "cancelled": FoodOrderStatus.REJECTED,
        "canceled": FoodOrderStatus.REJECTED,
        "failed": FoodOrderStatus.FAILED,
    }

    status = status_map.get(normalized, FoodOrderStatus.UNKNOWN)
    verified = (
        status == FoodOrderStatus.CONFIRMED
        and isinstance(provider_reference, str)
        and bool(provider_reference.strip())
    )

    message = (
        "Provider confirmation reference supplied."
        if verified
        else "Order status is not independently confirmed."
    )

    return FoodOrderVerification(
        order_id=order_id.strip(),
        status=status,
        verified=verified,
        provider_reference=provider_reference,
        message=message,
    )
