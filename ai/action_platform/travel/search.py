"""Travel search models for ModelNow."""

from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from typing import Any
from urllib.parse import urlparse


@dataclass(frozen=True)
class TravelSearchRequest:
    origin: str
    destination: str
    departure_date: date
    return_date: date | None = None
    passengers: int = 1
    cabin_class: str = "economy"
    currency: str = "INR"

    def __post_init__(self) -> None:
        for field_name in ("origin", "destination"):
            value = getattr(self, field_name)
            if not isinstance(value, str) or not value.strip():
                raise ValueError(f"{field_name} must not be empty.")
            if len(value) > 200:
                raise ValueError(f"{field_name} must be at most 200 characters.")

        if not isinstance(self.departure_date, date):
            raise TypeError("departure_date must be a date.")
        if isinstance(self.departure_date, type):
            raise TypeError("departure_date must be a date instance.")
        if self.return_date is not None:
            if not isinstance(self.return_date, date):
                raise TypeError("return_date must be a date or None.")
            if self.return_date < self.departure_date:
                raise ValueError("return_date cannot precede departure_date.")

        if (
            isinstance(self.passengers, bool)
            or not isinstance(self.passengers, int)
            or not 1 <= self.passengers <= 9
        ):
            raise ValueError("passengers must be an integer between 1 and 9.")

        allowed_classes = {"economy", "premium_economy", "business", "first"}
        if not isinstance(self.cabin_class, str):
            raise TypeError("cabin_class must be a string.")
        normalized_class = self.cabin_class.strip().lower()
        if normalized_class not in allowed_classes:
            raise ValueError("Unsupported cabin_class.")
        object.__setattr__(self, "cabin_class", normalized_class)

        if (
            not isinstance(self.currency, str)
            or len(self.currency.strip()) != 3
            or not self.currency.strip().isalpha()
        ):
            raise ValueError("currency must be a three-letter code.")
        object.__setattr__(self, "currency", self.currency.strip().upper())

        if self.origin.strip().casefold() == self.destination.strip().casefold():
            raise ValueError("origin and destination must be different.")

    def to_dict(self) -> dict[str, Any]:
        return {
            "origin": self.origin.strip(),
            "destination": self.destination.strip(),
            "departure_date": self.departure_date.isoformat(),
            "return_date": (
                self.return_date.isoformat() if self.return_date else None
            ),
            "passengers": self.passengers,
            "cabin_class": self.cabin_class,
            "currency": self.currency,
        }


@dataclass(frozen=True)
class TravelOption:
    option_id: str
    provider: str
    travel_type: str
    origin: str
    destination: str
    departure_at: str
    arrival_at: str
    price: Decimal
    currency: str
    booking_url: str | None = None
    details: dict[str, Any] | None = None

    def __post_init__(self) -> None:
        for field_name in (
            "option_id",
            "provider",
            "travel_type",
            "origin",
            "destination",
            "departure_at",
            "arrival_at",
        ):
            value = getattr(self, field_name)
            if not isinstance(value, str) or not value.strip():
                raise ValueError(f"{field_name} must not be empty.")

        if len(self.option_id) > 200:
            raise ValueError("option_id must be at most 200 characters.")

        if not isinstance(self.price, Decimal):
            try:
                normalized_price = Decimal(str(self.price))
            except Exception:
                raise ValueError("price must be a valid decimal.") from None
            object.__setattr__(self, "price", normalized_price)

        if not self.price.is_finite() or self.price < 0:
            raise ValueError("price must be finite and non-negative.")

        if (
            not isinstance(self.currency, str)
            or len(self.currency.strip()) != 3
            or not self.currency.strip().isalpha()
        ):
            raise ValueError("currency must be a three-letter code.")
        object.__setattr__(self, "currency", self.currency.strip().upper())

        if self.booking_url is not None:
            if not isinstance(self.booking_url, str):
                raise TypeError("booking_url must be a string or None.")
            parsed = urlparse(self.booking_url)
            if parsed.scheme != "https" or not parsed.netloc:
                raise ValueError("booking_url must be a valid HTTPS URL.")

        if self.details is not None and not isinstance(self.details, dict):
            raise TypeError("details must be a dictionary or None.")

    def to_dict(self) -> dict[str, Any]:
        return {
            "option_id": self.option_id,
            "provider": self.provider,
            "travel_type": self.travel_type,
            "origin": self.origin,
            "destination": self.destination,
            "departure_at": self.departure_at,
            "arrival_at": self.arrival_at,
            "price": format(self.price, "f"),
            "currency": self.currency,
            "booking_url": self.booking_url,
            "details": dict(self.details or {}),
        }
