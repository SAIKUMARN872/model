"""High-level coordinator for ModelNow travel search and booking actions."""

from __future__ import annotations

from dataclasses import dataclass
from threading import RLock
from typing import Any, Callable, Iterable

from .booking import TravelBooking, TravelBookingManager, TravelBookingRequest
from .search import TravelOption, TravelSearchRequest
from .verification import TravelBookingVerifier, TravelVerificationResult


@dataclass(frozen=True)
class TravelTaskResult:
    """Structured result returned by a travel action."""

    success: bool
    action: str
    message: str
    options: tuple[dict[str, Any], ...] = ()
    booking: dict[str, Any] | None = None
    verification: dict[str, Any] | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "success": self.success,
            "action": self.action,
            "message": self.message,
            "options": list(self.options),
            "booking": self.booking,
            "verification": self.verification,
        }


SearchHandler = Callable[
    [TravelSearchRequest],
    Iterable[TravelOption],
]


class TravelManager:
    """Coordinate registered search providers and approval-gated booking."""

    def __init__(
        self,
        booking_manager: TravelBookingManager | None = None,
        verifier: TravelBookingVerifier | None = None,
    ) -> None:
        self.booking_manager = booking_manager or TravelBookingManager()
        self.verifier = verifier or TravelBookingVerifier()
        self._search_handlers: dict[str, SearchHandler] = {}
        self._lock = RLock()

    def register_search_provider(
        self,
        provider_name: str,
        handler: SearchHandler,
    ) -> None:
        """Register a search integration; no live provider is enabled by default."""
        if not isinstance(provider_name, str) or not provider_name.strip():
            raise ValueError("provider_name must be a non-empty string")
        if not callable(handler):
            raise TypeError("handler must be callable")

        key = provider_name.strip().casefold()
        with self._lock:
            if key in self._search_handlers:
                raise ValueError(
                    f"Search provider already registered: {provider_name}"
                )
            self._search_handlers[key] = handler

    def search(self, request: TravelSearchRequest) -> TravelTaskResult:
        """Search configured providers and return validated matching options."""
        if not isinstance(request, TravelSearchRequest):
            raise TypeError("request must be a TravelSearchRequest")

        with self._lock:
            handlers = tuple(self._search_handlers.items())

        if not handlers:
            return TravelTaskResult(
                success=False,
                action="search",
                message="No travel search provider is configured.",
            )

        options: list[TravelOption] = []
        failures: list[str] = []
        seen_ids: set[str] = set()

        for provider_name, handler in handlers:
            try:
                results = handler(request)
                if results is None or isinstance(results, (str, bytes, dict)):
                    raise TypeError(
                        "Search handler must return an iterable of TravelOption objects"
                    )

                for option in results:
                    if not isinstance(option, TravelOption):
                        raise TypeError(
                            "Search handler returned a non-TravelOption value"
                        )

                    if (
                        option.origin.casefold() != request.origin.casefold()
                        or option.destination.casefold()
                        != request.destination.casefold()
                    ):
                        raise ValueError(
                            "Search option route does not match the requested route"
                        )

                    if option.currency != request.currency:
                        raise ValueError(
                            "Search option currency does not match the request"
                        )

                    if option.option_id in seen_ids:
                        continue

                    seen_ids.add(option.option_id)
                    options.append(option)
            except Exception as exc:
                failures.append(f"{provider_name}: {type(exc).__name__}: {exc}")

        if options:
            message = f"Found {len(options)} travel option(s)."
            if failures:
                message += f" {len(failures)} provider(s) failed."
            return TravelTaskResult(
                success=True,
                action="search",
                message=message,
                options=tuple(option.to_dict() for option in options),
            )

        message = "No matching travel options were returned."
        if failures:
            message += " Provider errors: " + " | ".join(failures)

        return TravelTaskResult(
            success=False,
            action="search",
            message=message,
        )

    def prepare_booking(
        self,
        request: TravelBookingRequest,
    ) -> TravelTaskResult:
        """Prepare a booking for approval without making a reservation."""
        booking = self.booking_manager.prepare(request)
        return TravelTaskResult(
            success=True,
            action="prepare_booking",
            message=(
                "Booking prepared. Explicit approval is required before submission."
            ),
            booking=booking.to_dict(),
        )

    def approve_booking(
        self,
        booking_id: str,
        *,
        approver_id: str,
    ) -> TravelTaskResult:
        """Record the required approval before booking submission."""
        booking = self.booking_manager.approve(
            booking_id,
            approver_id=approver_id,
        )
        return TravelTaskResult(
            success=True,
            action="approve_booking",
            message="Booking approved. It has not yet been submitted to the provider.",
            booking=booking.to_dict(),
        )

    def submit_booking(self, booking_id: str) -> TravelTaskResult:
        """Submit an approved booking to its registered provider handler."""
        booking = self.booking_manager.submit(booking_id)
        confirmed = booking.status == "confirmed"
        return TravelTaskResult(
            success=confirmed,
            action="submit_booking",
            message=booking.message,
            booking=booking.to_dict(),
        )

    def verify_booking(
        self,
        request: TravelBookingRequest,
        booking: TravelBooking,
    ) -> TravelTaskResult:
        """Run local consistency checks on a booking result."""
        result: TravelVerificationResult = self.verifier.verify(request, booking)
        return TravelTaskResult(
            success=result.valid,
            action="verify_booking",
            message=result.message,
            booking=booking.to_dict(),
            verification=result.to_dict(),
        )
