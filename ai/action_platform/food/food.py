"""Food-order request models for ModelNow."""

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class FoodOrderItem:
    """A requested menu item and quantity."""

    item_id: str
    quantity: int = 1

    def __post_init__(self) -> None:
        if not isinstance(self.item_id, str) or not self.item_id.strip():
            raise ValueError("Food item ID must not be empty.")
        if isinstance(self.quantity, bool) or not isinstance(self.quantity, int):
            raise ValueError("Food item quantity must be an integer.")
        if not 1 <= self.quantity <= 100:
            raise ValueError("Food item quantity must be between 1 and 100.")


@dataclass(frozen=True)
class FoodOrderRequest:
    """A request to prepare a food order for review."""

    restaurant_id: str
    items: tuple[FoodOrderItem, ...]
    delivery_address: str | None = None
    special_instructions: str = ""
    order_id: str = ""
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if (
            not isinstance(self.restaurant_id, str)
            or not self.restaurant_id.strip()
        ):
            raise ValueError("Restaurant ID must not be empty.")
        if not isinstance(self.items, tuple) or not self.items:
            raise ValueError("At least one food item is required.")
        if not all(isinstance(item, FoodOrderItem) for item in self.items):
            raise ValueError("items must contain FoodOrderItem objects.")
        if self.delivery_address is not None and (
            not isinstance(self.delivery_address, str)
            or not self.delivery_address.strip()
        ):
            raise ValueError("Delivery address must be a non-empty string.")
        if not isinstance(self.special_instructions, str):
            raise ValueError("Special instructions must be a string.")
        if len(self.special_instructions) > 2000:
            raise ValueError("Special instructions are too long.")
        if not isinstance(self.order_id, str) or len(self.order_id) > 200:
            raise ValueError("Order ID must be a string of at most 200 characters.")
        if not isinstance(self.metadata, dict):
            raise ValueError("Metadata must be a dictionary.")
