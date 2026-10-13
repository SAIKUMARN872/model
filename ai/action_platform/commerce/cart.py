"""Cart validation and total calculation for ModelNow commerce."""

from dataclasses import dataclass
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from typing import Any


@dataclass(frozen=True)
class CartItem:
    product_id: str
    quantity: int
    unit_price: Decimal

    @property
    def subtotal(self) -> Decimal:
        return (self.unit_price * self.quantity).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "product_id": self.product_id,
            "quantity": self.quantity,
            "unit_price": f"{self.unit_price:.2f}",
            "subtotal": f"{self.subtotal:.2f}",
        }


@dataclass(frozen=True)
class CartSummary:
    items: tuple[CartItem, ...]
    currency: str
    subtotal: Decimal
    item_count: int

    def to_dict(self) -> dict[str, Any]:
        return {
            "items": [item.to_dict() for item in self.items],
            "currency": self.currency,
            "subtotal": f"{self.subtotal:.2f}",
            "item_count": self.item_count,
        }


class CartManager:
    """Validate cart contents and calculate totals from supplied prices."""

    SUPPORTED_CURRENCIES = {
        "INR", "USD", "EUR", "GBP", "AUD", "CAD", "SGD", "JPY"
    }

    def summarize(
        self,
        items: list[dict[str, Any]],
        currency: str = "INR",
    ) -> CartSummary:
        if not isinstance(items, list):
            raise ValueError("Cart items must be a list.")

        if not isinstance(currency, str):
            raise ValueError("Currency must be a string.")

        currency = currency.strip().upper()
        if currency not in self.SUPPORTED_CURRENCIES:
            raise ValueError(f"Unsupported currency: {currency}")

        validated_items = []
        for index, item in enumerate(items):
            if not isinstance(item, dict):
                raise ValueError(f"Cart item {index} must be a dictionary.")

            product_id = item.get("product_id")
            quantity = item.get("quantity")
            raw_price = item.get("unit_price")

            if not isinstance(product_id, str) or not product_id.strip():
                raise ValueError(
                    f"Cart item {index} requires a product_id."
                )

            if (
                isinstance(quantity, bool)
                or not isinstance(quantity, int)
                or quantity <= 0
            ):
                raise ValueError(
                    f"Cart item {index} quantity must be a positive integer."
                )

            if raw_price is None:
                raise ValueError(
                    f"Cart item {index} requires a unit_price."
                )

            try:
                price = Decimal(str(raw_price))
            except (InvalidOperation, ValueError):
                raise ValueError(
                    f"Cart item {index} has an invalid unit_price."
                ) from None

            if not price.is_finite() or price < 0:
                raise ValueError(
                    f"Cart item {index} unit_price must be non-negative."
                )

            validated_items.append(
                CartItem(
                    product_id=product_id.strip(),
                    quantity=quantity,
                    unit_price=price,
                )
            )

        subtotal = sum(
            (item.subtotal for item in validated_items),
            Decimal("0.00"),
        ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        return CartSummary(
            items=tuple(validated_items),
            currency=currency,
            subtotal=subtotal,
            item_count=sum(item.quantity for item in validated_items),
        )
