"""Product catalog models for ModelNow shopping actions."""

from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation
from typing import Any


def _validated_price(value: Decimal | str | int | float) -> Decimal:
    try:
        price = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        raise ValueError("Price must be a valid decimal.") from None

    if not price.is_finite() or price < 0:
        raise ValueError("Price must be finite and non-negative.")

    return price


@dataclass(frozen=True)
class Product:
    """A product listing supplied by a catalog or retailer integration."""

    product_id: str
    name: str
    price: Decimal
    currency: str = "INR"
    retailer: str = ""
    available: bool = True
    product_url: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not isinstance(self.product_id, str) or not self.product_id.strip():
            raise ValueError("product_id must not be empty.")
        if len(self.product_id) > 200:
            raise ValueError("product_id must be at most 200 characters.")

        if not isinstance(self.name, str) or not self.name.strip():
            raise ValueError("Product name must not be empty.")
        if len(self.name) > 500:
            raise ValueError("Product name must be at most 500 characters.")

        object.__setattr__(self, "price", _validated_price(self.price))

        if (
            not isinstance(self.currency, str)
            or len(self.currency) != 3
            or not self.currency.isascii()
            or not self.currency.isalpha()
        ):
            raise ValueError("currency must be a three-letter ASCII code.")

        if not isinstance(self.retailer, str) or len(self.retailer) > 200:
            raise ValueError("retailer must be a string of at most 200 characters.")

        if not isinstance(self.available, bool):
            raise ValueError("available must be a boolean.")

        if self.product_url is not None and (
            not isinstance(self.product_url, str)
            or len(self.product_url) > 2048
        ):
            raise ValueError("product_url must be a string of at most 2048 characters.")

        if not isinstance(self.metadata, dict):
            raise ValueError("metadata must be a dictionary.")
        if not all(isinstance(key, str) for key in self.metadata):
            raise ValueError("metadata keys must be strings.")
