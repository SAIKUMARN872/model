"""Shopping cart models and operations for ModelNow."""

from dataclasses import dataclass
from decimal import Decimal
from threading import RLock
from typing import Any

from .product import Product


@dataclass(frozen=True)
class CartItem:
    product: Product
    quantity: int

    def __post_init__(self) -> None:
        if not isinstance(self.product, Product):
            raise TypeError("product must be a Product.")
        if (
            isinstance(self.quantity, bool)
            or not isinstance(self.quantity, int)
            or not 1 <= self.quantity <= 100
        ):
            raise ValueError("quantity must be an integer between 1 and 100.")

    @property
    def line_total(self) -> Decimal:
        return self.product.price * self.quantity

    def to_dict(self) -> dict[str, Any]:
        return {
            "product_id": self.product.product_id,
            "name": self.product.name,
            "retailer": self.product.retailer,
            "unit_price": format(self.product.price, "f"),
            "quantity": self.quantity,
            "line_total": format(self.line_total, "f"),
            "currency": self.product.currency.upper(),
        }


@dataclass(frozen=True)
class CartSnapshot:
    cart_id: str
    items: tuple[CartItem, ...]
    currency: str | None
    subtotal: Decimal

    def to_dict(self) -> dict[str, Any]:
        return {
            "cart_id": self.cart_id,
            "items": [item.to_dict() for item in self.items],
            "currency": self.currency,
            "subtotal": format(self.subtotal, "f"),
            "item_count": sum(item.quantity for item in self.items),
        }


class ShoppingCart:
    """Thread-safe in-memory cart; it does not reserve inventory."""

    def __init__(self, cart_id: str) -> None:
        if not isinstance(cart_id, str) or not cart_id.strip():
            raise ValueError("cart_id must not be empty.")
        if len(cart_id) > 200:
            raise ValueError("cart_id must be at most 200 characters.")

        self.cart_id = cart_id
        self._items: dict[str, CartItem] = {}
        self._lock = RLock()

    def add(self, product: Product, quantity: int = 1) -> CartSnapshot:
        item = CartItem(product=product, quantity=quantity)

        if not product.available:
            raise ValueError("Product is currently unavailable.")

        with self._lock:
            existing = self._items.get(product.product_id)

            if existing and (
                existing.product.currency.upper() != product.currency.upper()
                or existing.product.price != product.price
                or existing.product.retailer != product.retailer
            ):
                raise ValueError(
                    "Product details changed; remove the existing item before re-adding it."
                )

            existing_currencies = {
                cart_item.product.currency.upper()
                for cart_item in self._items.values()
                if cart_item.product.product_id != product.product_id
            }
            incoming_currency = product.currency.upper()

            if existing_currencies and incoming_currency not in existing_currencies:
                raise ValueError("A cart cannot contain multiple currencies.")

            total_quantity = quantity + (existing.quantity if existing else 0)
            if total_quantity > 100:
                raise ValueError("Combined product quantity cannot exceed 100.")

            self._items[product.product_id] = CartItem(product, total_quantity)
            return self.snapshot()

    def remove(self, product_id: str) -> bool:
        with self._lock:
            return self._items.pop(product_id, None) is not None

    def clear(self) -> None:
        with self._lock:
            self._items.clear()

    def snapshot(self) -> CartSnapshot:
        with self._lock:
            items = tuple(self._items.values())
            currencies = {item.product.currency.upper() for item in items}
            if len(currencies) > 1:
                raise ValueError("A cart cannot contain multiple currencies.")

            currency = next(iter(currencies), None)
            subtotal = sum(
                (item.line_total for item in items),
                start=Decimal("0"),
            )

            return CartSnapshot(
                cart_id=self.cart_id,
                items=items,
                currency=currency,
                subtotal=subtotal,
            )

    def _validate_currency(self) -> None:
        currencies = {
            item.product.currency.upper() for item in self._items.values()
        }
        if len(currencies) > 1:
            raise ValueError("A cart cannot contain multiple currencies.")
