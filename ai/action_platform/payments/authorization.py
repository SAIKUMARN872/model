"""Explicit approval controls for ModelNow payment requests."""

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from threading import RLock
from typing import Any
from uuid import uuid4

from .payment import PaymentRequest


@dataclass(frozen=True)
class PaymentAuthorization:
    authorization_id: str
    payment_id: str
    order_id: str
    amount: Decimal
    currency: str
    approved: bool
    created_at: datetime
    expires_at: datetime
    reason: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "authorization_id": self.authorization_id,
            "payment_id": self.payment_id,
            "order_id": self.order_id,
            "amount": format(self.amount, "f"),
            "currency": self.currency,
            "approved": self.approved,
            "created_at": self.created_at.isoformat(),
            "expires_at": self.expires_at.isoformat(),
            "reason": self.reason,
        }


class PaymentAuthorizationManager:
    """In-memory payment approval manager.

    This manager records an application's explicit approval decision.
    It does not authenticate the approver or contact a payment provider.
    Production deployments must enforce identity, access control, and
    durable audit logging around calls to this class.
    """

    def __init__(self, *, approval_ttl_seconds: int = 300) -> None:
        if (
            isinstance(approval_ttl_seconds, bool)
            or not isinstance(approval_ttl_seconds, int)
            or approval_ttl_seconds <= 0
        ):
            raise ValueError("approval_ttl_seconds must be a positive integer.")

        self._ttl = timedelta(seconds=approval_ttl_seconds)
        self._records: dict[str, PaymentAuthorization] = {}
        self._lock = RLock()

    def authorize(
        self,
        request: PaymentRequest,
        *,
        approved: bool,
        approver_id: str | None = None,
        reason: str | None = None,
    ) -> PaymentAuthorization:
        if not isinstance(request, PaymentRequest):
            raise TypeError("request must be a PaymentRequest.")
        if not isinstance(approved, bool):
            raise ValueError("approved must be a boolean.")
        if approved and (
            not isinstance(approver_id, str) or not approver_id.strip()
        ):
            raise ValueError("An approver_id is required for approval.")
        if approver_id is not None and (
            not isinstance(approver_id, str) or len(approver_id) > 200
        ):
            raise ValueError("approver_id must be a string of at most 200 characters.")
        if reason is not None and (
            not isinstance(reason, str) or len(reason) > 1000
        ):
            raise ValueError("reason must be a string of at most 1000 characters.")

        if not request.payment_id.strip():
            raise ValueError("A payment_id is required before authorization.")

        now = datetime.now(timezone.utc)
        record = PaymentAuthorization(
            authorization_id=str(uuid4()),
            payment_id=request.payment_id,
            order_id=request.order_id,
            amount=request.amount,
            currency=request.currency.upper(),
            approved=approved,
            created_at=now,
            expires_at=now + self._ttl,
            reason=reason,
        )

        with self._lock:
            if request.payment_id in self._records:
                raise ValueError("This payment already has an authorization record.")
            self._records[request.payment_id] = record

        return record

    def is_authorized(self, request: PaymentRequest) -> bool:
        if not isinstance(request, PaymentRequest):
            return False
        with self._lock:
            record = self._records.get(request.payment_id)
            if record is None:
                return False

            now = datetime.now(timezone.utc)
            return (
                record.approved
                and now < record.expires_at
                and record.payment_id == request.payment_id
                and record.order_id == request.order_id
                and record.amount == request.amount
                and record.currency == request.currency.upper()
            )

    def get(self, payment_id: str) -> PaymentAuthorization | None:
        with self._lock:
            return self._records.get(payment_id)

    def revoke(self, payment_id: str) -> bool:
        with self._lock:
            record = self._records.get(payment_id)
            if record is None or not record.approved:
                return False

            self._records[payment_id] = PaymentAuthorization(
                authorization_id=record.authorization_id,
                payment_id=record.payment_id,
                order_id=record.order_id,
                amount=record.amount,
                currency=record.currency,
                approved=False,
                created_at=record.created_at,
                expires_at=record.expires_at,
                reason="Authorization revoked.",
            )
            return True
