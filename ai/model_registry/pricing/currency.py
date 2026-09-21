from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP


SUPPORTED_CURRENCIES = frozenset(
    {
        "USD",
        "EUR",
        "GBP",
        "INR",
        "JPY",
    }
)


def normalize_currency(currency: str) -> str:
    if not isinstance(currency, str):
        raise TypeError("currency must be a string")

    value = currency.strip().upper()

    if not value:
        raise ValueError("currency cannot be empty")

    return value


def validate_currency(currency: str) -> str:
    value = normalize_currency(currency)

    if value not in SUPPORTED_CURRENCIES:
        raise ValueError(
            f"Unsupported currency: {value}"
        )

    return value


def round_money(
    amount: float | Decimal,
    places: int = 6,
) -> Decimal:
    if places < 0:
        raise ValueError(
            "places cannot be negative"
        )

    value = Decimal(str(amount))

    quantum = Decimal("1").scaleb(-places)

    return value.quantize(
        quantum,
        rounding=ROUND_HALF_UP,
    )


__all__ = [
    "SUPPORTED_CURRENCIES",
    "normalize_currency",
    "validate_currency",
    "round_money",
]
