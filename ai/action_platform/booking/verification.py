"""Verification helpers for ModelNow booking results."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class BookingVerification:
    """Outcome of validating a booking provider response."""

    verified: bool
    status: str
    confirmation_id: str | None = None
    provider: str | None = None
    issues: tuple[str, ...] = field(default_factory=tuple)

    def to_dict(self) -> dict[str, Any]:
        return {
            "verified": self.verified,
            "status": self.status,
            "confirmation_id": self.confirmation_id,
            "provider": self.provider,
            "issues": list(self.issues),
        }


class BookingVerifier:
    """Validates the structure and status of provider booking responses."""

    CONFIRMED_STATUSES = {"confirmed", "booked", "success", "succeeded"}
    PENDING_STATUSES = {"pending", "processing", "awaiting_confirmation"}
    FAILED_STATUSES = {"failed", "cancelled", "canceled", "rejected"}

    def verify(self, response: Any) -> BookingVerification:
        if not isinstance(response, dict):
            return BookingVerification(
                verified=False,
                status="unverified",
                issues=("Provider response must be a dictionary.",),
            )

        raw_status = response.get("status")
        if not isinstance(raw_status, str) or not raw_status.strip():
            return BookingVerification(
                verified=False,
                status="unverified",
                issues=("Provider response is missing a status.",),
            )

        status = raw_status.strip().lower()

        if status in self.PENDING_STATUSES:
            return BookingVerification(
                verified=False,
                status="pending",
                issues=("The provider has not confirmed the booking yet.",),
            )

        if status in self.FAILED_STATUSES:
            return BookingVerification(
                verified=False,
                status="failed",
                issues=(f"Provider booking status is '{status}'.",),
            )

        if status not in self.CONFIRMED_STATUSES:
            return BookingVerification(
                verified=False,
                status="unverified",
                issues=(f"Unrecognized provider status: '{status}'.",),
            )

        confirmation_id = response.get("provider_confirmation_id")
        if not isinstance(confirmation_id, str) or not confirmation_id.strip():
            return BookingVerification(
                verified=False,
                status="unverified",
                issues=("A provider confirmation ID is required.",),
            )

        provider = response.get("provider")
        if provider is not None and (
            not isinstance(provider, str) or not provider.strip()
        ):
            return BookingVerification(
                verified=False,
                status="unverified",
                issues=("Provider name must be a non-empty string when supplied.",),
            )

        return BookingVerification(
            verified=True,
            status="confirmed",
            confirmation_id=confirmation_id.strip(),
            provider=provider.strip() if isinstance(provider, str) else None,
        )


def verify_booking(response: Any) -> BookingVerification:
    """Convenience function for verifying a provider response."""
    return BookingVerifier().verify(response)
