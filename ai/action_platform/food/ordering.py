"""Safe food-order preparation for ModelNow."""

from dataclasses import dataclass
from decimal import Decimal

from .food import FoodOrderRequest
from .restaurant import Restaurant
from .food import FoodOrderItem


@dataclass(frozen=True)
class PreparedFoodOrder:
    """A validated order summary awaiting user approval."""

    order_id: str
    restaurant_id: str
    currency: str
    items: tuple[dict, ...]
    subtotal: str
    requires_approval: bool = True
    approved: bool = False

    def to_dict(self) -> dict:
        return {
            "order_id": self.order_id,
            "restaurant_id": self.restaurant_id,
            "currency": self.currency,
            "items": [dict(item) for item in self.items],
            "subtotal": self.subtotal,
            "requires_approval": self.requires_approval,
            "approved": self.approved,
            "status": "awaiting_approval",
        }


def prepare_food_order(
    request: FoodOrderRequest,
    restaurant: Restaurant,
) -> PreparedFoodOrder:
    """Validate menu selections and prepare an order summary."""
    if not isinstance(request, FoodOrderRequest):
        raise TypeError("request must be a FoodOrderRequest.")
    if not isinstance(restaurant, Restaurant):
        raise TypeError("restaurant must be a Restaurant.")
    if request.restaurant_id != restaurant.restaurant_id:
        raise ValueError("Request restaurant does not match supplied restaurant.")
    if not restaurant.accepts_orders:
        raise ValueError("Restaurant is not accepting orders.")

    menu_by_id = {item.item_id: item for item in restaurant.menu}
    prepared_items = []
    subtotal = Decimal("0")
    currency = None

    for requested in request.items:
        menu_item = menu_by_id.get(requested.item_id)
        if menu_item is None:
            raise ValueError(f"Menu item not found: {requested.item_id}")
        if not menu_item.available:
            raise ValueError(f"Menu item is unavailable: {menu_item.name}")

        if currency is None:
            currency = menu_item.currency
        elif currency != menu_item.currency:
            raise ValueError("All order items must use the same currency.")

        unit_price = Decimal(str(menu_item.price))
        line_total = unit_price * requested.quantity
        subtotal += line_total

        prepared_items.append({
            "item_id": menu_item.item_id,
            "name": menu_item.name,
            "quantity": requested.quantity,
            "unit_price": format(unit_price, "f"),
            "line_total": format(line_total, "f"),
        })

    return PreparedFoodOrder(
        order_id=request.order_id,
        restaurant_id=restaurant.restaurant_id,
        currency=currency or "INR",
        items=tuple(prepared_items),
        subtotal=format(subtotal, "f"),
    )
