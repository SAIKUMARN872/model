"""Travel booking verification for ModelNow."""

from dataclasses import dataclass
from typing import Any

from .booking import TravelBooking, TravelBookingRequest


@dataclass(frozen=True)
class TravelVerificationResult:
    valid: bool
    booking_id: str
    status: str
    checks: dict[str, bool]
    message: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "valid": self.valid,
            "booking_id": self.booking_id,
            "status": self.status,
            "checks": dict(self.checks),
            "message": self.message,
        }


class TravelBookingVerifier:
    """Validate local booking data and provider confirmation consistency.

    These checks do not independently authenticate a provider or prove that
    a reservation exists. Production integrations must verify with the provider.
    """

    def verify(
        self,
        request: TravelBookingRequest,
        booking: TravelBooking,
    ) -> TravelVerificationResult:
        if not isinstance(request, TravelBookingRequest):
            raise TypeError("request must be a TravelBookingRequest.")
        if not isinstance(booking, TravelBooking):
            raise TypeError("booking must be a TravelBooking.")

        checks = {
            "booking_id_matches": booking.booking_id == request.booking_id,
            "option_matches": booking.option_id == request.option.option_id,
            "provider_matches": (
                booking.provider.strip().casefold()
                == request.option.provider.strip().casefold()
            ),
            "price_matches": booking.price == request.option.price,
            "currency_matches": (
                booking.currency.upper() == request.option.currency.upper()
            ),
            "status_recognized": booking.status in {
                "awaiting_approval",
                "approved",
                "confirmed",
                "failed",
                "unknown",
            },
            "confirmed_has_reference": (
                booking.status != "confirmed"
                or (
                    isinstance(booking.provider_reference, str)
                    and bool(booking.provider_reference.strip())
                )
            ),
        }

        valid = all(checks.values())
        if not valid:
            message = "Booking data failed one or more consistency checks."
        elif booking.status == "confirmed":
            message = (
                "Local booking details are consistent and include a provider reference. "
                "Independently verify the reservation with the provider."
            )
        elif booking.status == "unknown":
            message = (
                "Booking outcome is uncertain. Check with the provider before retrying."
            )
        else:
            message = (
                "Booking details are consistent, but the reservation is not confirmed."
            )

        return TravelVerificationResult(
            valid=valid,
            booking_id=booking.booking_id,
            status=booking.status,
            checks=checks,
            message=message,
        )
