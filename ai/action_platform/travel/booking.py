"""Booking models for ModelNow travel actions."""

from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal
from threading import RLock
from typing import Any
from uuid import uuid4

from .search import TravelOption, TravelSearchRequest


@dataclass(frozen=True)
class TravelBookingRequest:
    option: TravelOption
    search_request: TravelSearchRequest
    passenger_names: tuple[str, ...]
    contact_email: str
    booking_id: str

    def __post_init__(self) -> None:
        if not isinstance(self.option, TravelOption):
            raise TypeError("option must be a TravelOption.")
        if not isinstance(self.search_request, TravelSearchRequest):
            raise TypeError("search_request must be a TravelSearchRequest.")

        if len(self.passenger_names) != self.search_request.passengers:
            raise ValueError(
                "Passenger name count must match the requested passenger count."
            )

        for name in self.passenger_names:
            if not isinstance(name, str) or not name.strip():
                raise ValueError("Passenger names must not be empty.")

        if (
            not isinstance(self.contact_email, str)
            or "@" not in self.contact_email
            or self.contact_email.startswith("@")
            or self.contact_email.endswith("@")
        ):
            raise ValueError("A valid contact_email is required.")

        if not isinstance(self.booking_id, str) or not self.booking_id.strip():
            raise ValueError("booking_id must not be empty.")


@dataclass(frozen=True)
class TravelBooking:
    booking_id: str
    option_id: str
    provider: str
    status: str
    price: Decimal
    currency: str
    created_at: datetime
    provider_reference: str | None = None
    message: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "booking_id": self.booking_id,
            "option_id": self.option_id,
            "provider": self.provider,
            "status": self.status,
            "price": format(self.price, "f"),
            "currency": self.currency,
            "created_at": self.created_at.isoformat(),
            "provider_reference": self.provider_reference,
            "message": self.message,
        }


class TravelBookingManager:
    """Approval-gated booking coordinator; provider integration is explicit."""

    def __init__(self) -> None:
        self._requests: dict[str, TravelBookingRequest] = {}
        self._approvals: set[str] = set()
        self._results: dict[str, TravelBooking] = {}
        self._handlers: dict[str, Any] = {}
        self._attempted: set[str] = set()
        self._lock = RLock()

    def prepare(self, request: TravelBookingRequest) -> TravelBooking:
        if not isinstance(request, TravelBookingRequest):
            raise TypeError("request must be a TravelBookingRequest.")

        if request.option.currency != request.search_request.currency:
            raise ValueError("Travel option currency does not match search currency.")

        if (
            request.option.origin.strip().casefold()
            != request.search_request.origin.strip().casefold()
            or request.option.destination.strip().casefold()
            != request.search_request.destination.strip().casefold()
        ):
            raise ValueError("Travel option route does not match the search request.")

        with self._lock:
            if request.booking_id in self._requests:
                raise ValueError("booking_id already exists.")

            self._requests[request.booking_id] = request

        return TravelBooking(
            booking_id=request.booking_id,
            option_id=request.option.option_id,
            provider=request.option.provider,
            status="awaiting_approval",
            price=request.option.price,
            currency=request.option.currency,
            created_at=datetime.now(timezone.utc),
            message="Booking prepared. No reservation or payment has been made.",
        )

    def register_handler(self, provider: str, handler: Any) -> None:
        if not isinstance(provider, str) or not provider.strip():
            raise ValueError("provider must not be empty.")
        if not callable(handler):
            raise TypeError("handler must be callable.")

        key = provider.strip().casefold()
        with self._lock:
            if key in self._handlers:
                raise ValueError("A handler is already registered for this provider.")
            self._handlers[key] = handler

    def approve(self, booking_id: str, *, approver_id: str) -> TravelBooking:
        if not isinstance(approver_id, str) or not approver_id.strip():
            raise ValueError("An explicit approver_id is required.")

        with self._lock:
            request = self._requests.get(booking_id)
            if request is None:
                raise KeyError("Travel booking request not found.")
            if booking_id in self._attempted:
                raise ValueError("Booking has already been attempted.")

            self._approvals.add(booking_id)

        return TravelBooking(
            booking_id=booking_id,
            option_id=request.option.option_id,
            provider=request.option.provider,
            status="approved",
            price=request.option.price,
            currency=request.option.currency,
            created_at=datetime.now(timezone.utc),
            message="Approval recorded. The booking has not yet been submitted.",
        )

    def submit(self, booking_id: str) -> TravelBooking:
        with self._lock:
            request = self._requests.get(booking_id)
            if request is None:
                raise KeyError("Travel booking request not found.")

            if booking_id not in self._approvals:
                raise PermissionError("Explicit approval is required before booking.")

            if booking_id in self._attempted:
                previous = self._results.get(booking_id)
                if previous is not None:
                    return previous
                raise RuntimeError(
                    "Booking outcome is unresolved; verify with the provider before retrying."
                )

            handler = self._handlers.get(request.option.provider.strip().casefold())
            if handler is None:
                raise LookupError("No booking handler is registered for this provider.")

            self._attempted.add(booking_id)

        try:
            response = handler(request)
            if (
                not isinstance(response, dict)
                or response.get("status") != "confirmed"
                or not isinstance(response.get("provider_reference"), str)
                or not response["provider_reference"].strip()
            ):
                booking = TravelBooking(
                    booking_id=booking_id,
                    option_id=request.option.option_id,
                    provider=request.option.provider,
                    status="unknown",
                    price=request.option.price,
                    currency=request.option.currency,
                    created_at=datetime.now(timezone.utc),
                    message="Provider did not confirm booking; verify before retrying.",
                )
            else:
                booking = TravelBooking(
                    booking_id=booking_id,
                    option_id=request.option.option_id,
                    provider=request.option.provider,
                    status="confirmed",
                    price=request.option.price,
                    currency=request.option.currency,
                    created_at=datetime.now(timezone.utc),
                    provider_reference=response["provider_reference"],
                    message="Provider reported a confirmed booking.",
                )
        except Exception:
            booking = TravelBooking(
                booking_id=booking_id,
                option_id=request.option.option_id,
                provider=request.option.provider,
                status="unknown",
                price=request.option.price,
                currency=request.option.currency,
                created_at=datetime.now(timezone.utc),
                message="Booking outcome is unknown; verify with the provider before retrying.",
            )

        with self._lock:
            self._results[booking_id] = booking
            return booking
