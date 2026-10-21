"""Restaurant and menu data models for ModelNow."""

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class MenuItem:
    """A menu item returned by a trusted restaurant provider."""

    item_id: str
    name: str
    price: float
    currency: str = "INR"
    available: bool = True
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not isinstance(self.item_id, str) or not self.item_id.strip():
            raise ValueError("Menu item ID must not be empty.")
        if not isinstance(self.name, str) or not self.name.strip():
            raise ValueError("Menu item name must not be empty.")
        if isinstance(self.price, bool) or not isinstance(self.price, (int, float)):
            raise ValueError("Menu item price must be numeric.")
        if self.price < 0:
            raise ValueError("Menu item price cannot be negative.")
        if not isinstance(self.currency, str) or len(self.currency) != 3:
            raise ValueError("Currency must be a three-letter code.")
        if not isinstance(self.available, bool):
            raise ValueError("available must be a boolean.")
        if not isinstance(self.metadata, dict):
            raise ValueError("metadata must be a dictionary.")


@dataclass(frozen=True)
class Restaurant:
    """Restaurant details supplied by a trusted provider."""

    restaurant_id: str
    name: str
    menu: tuple[MenuItem, ...] = ()
    accepts_orders: bool = True
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not isinstance(self.restaurant_id, str) or not self.restaurant_id.strip():
            raise ValueError("Restaurant ID must not be empty.")
        if not isinstance(self.name, str) or not self.name.strip():
            raise ValueError("Restaurant name must not be empty.")
        if not isinstance(self.menu, tuple) or not all(
            isinstance(item, MenuItem) for item in self.menu
        ):
            raise ValueError("menu must be a tuple of MenuItem objects.")
        if not isinstance(self.accepts_orders, bool):
            raise ValueError("accepts_orders must be a boolean.")
        if not isinstance(self.metadata, dict):
            raise ValueError("metadata must be a dictionary.")
