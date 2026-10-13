from __future__ import annotations

from threading import RLock
from typing import Any
from uuid import uuid4

from .schemas import SalesStatus, require_number, require_text


class SalesTools:
    """In-memory sales catalog and quote/order records."""

    def __init__(
        self,
        maximum_discount_percent: float = 25.0,
        minimum_margin_percent: float = 10.0,
    ) -> None:
        if not 0 <= maximum_discount_percent <= 100:
            raise ValueError("maximum_discount_percent must be between 0 and 100")
        if not 0 <= minimum_margin_percent < 100:
            raise ValueError("minimum_margin_percent must be between 0 and 100")
        self.maximum_discount_percent = maximum_discount_percent
        self.minimum_margin_percent = minimum_margin_percent
        self._lock = RLock()
        self.products: dict[str, dict[str, Any]] = {}
        self.quotes: dict[str, dict[str, Any]] = {}
        self.orders: dict[str, dict[str, Any]] = {}

    @staticmethod
    def _new_id(prefix: str) -> str:
        return f"{prefix}_{uuid4().hex[:12]}"

    def add_product(self, payload: dict[str, Any]) -> dict[str, Any]:
        sku = require_text(payload, "sku")
        name = require_text(payload, "name")
        price = require_number(payload, "unit_price", minimum=0.01)
        cost = require_number(payload, "unit_cost", minimum=0)
        if cost > price:
            raise ValueError("unit_cost cannot exceed unit_price")
        with self._lock:
            if any(p["sku"] == sku for p in self.products.values()):
                raise ValueError(f"SKU already exists: {sku}")
            product_id = self._new_id("product")
            product = {
                "product_id": product_id,
                "sku": sku,
                "name": name,
                "unit_price": round(price, 2),
                "unit_cost": round(cost, 2),
            }
            self.products[product_id] = product
            return dict(product)

    def list_products(self) -> list[dict[str, Any]]:
        with self._lock:
            return [dict(product) for product in self.products.values()]

    def create_quote(self, payload: dict[str, Any]) -> dict[str, Any]:
        product_id = require_text(payload, "product_id")
        customer_id = require_text(payload, "customer_id")
        quantity_value = require_number(payload, "quantity", minimum=1)
        if not quantity_value.is_integer():
            raise ValueError("quantity must be a whole number")
        quantity = int(quantity_value)
        discount = require_number(
            payload, "discount_percent", minimum=0, maximum=100
        )
        if discount > self.maximum_discount_percent:
            raise ValueError(
                f"discount exceeds maximum of {self.maximum_discount_percent}%"
            )

        with self._lock:
            product = self.products.get(product_id)
            if product is None:
                raise ValueError("Product not found")

            gross = product["unit_price"] * quantity
            discount_amount = gross * discount / 100
            total = round(gross - discount_amount, 2)
            cost_total = product["unit_cost"] * quantity
            margin = 0.0 if total == 0 else (total - cost_total) / total * 100
            if margin < self.minimum_margin_percent:
                raise ValueError(
                    f"Quote margin {margin:.2f}% is below minimum "
                    f"{self.minimum_margin_percent}%"
                )

            quote_id = self._new_id("quote")
            quote = {
                "quote_id": quote_id,
                "customer_id": customer_id,
                "product_id": product_id,
                "quantity": quantity,
                "unit_price": product["unit_price"],
                "discount_percent": discount,
                "gross_amount": round(gross, 2),
                "discount_amount": round(discount_amount, 2),
                "total": total,
                "estimated_margin_percent": round(margin, 2),
                "status": SalesStatus.PENDING_APPROVAL,
            }
            self.quotes[quote_id] = quote
            return dict(quote)

    def decide_quote(self, payload: dict[str, Any]) -> dict[str, Any]:
        quote_id = require_text(payload, "quote_id")
        decision = require_text(payload, "decision").lower()
        if decision not in {"approve", "reject"}:
            raise ValueError("decision must be 'approve' or 'reject'")
        with self._lock:
            quote = self.quotes.get(quote_id)
            if quote is None:
                raise ValueError("Quote not found")
            if quote["status"] != SalesStatus.PENDING_APPROVAL:
                raise ValueError("Quote is not awaiting approval")
            quote["status"] = (
                SalesStatus.APPROVED
                if decision == "approve"
                else SalesStatus.REJECTED
            )
            quote["approval_note"] = payload.get("note", "")
            return dict(quote)

    def create_order(self, payload: dict[str, Any]) -> dict[str, Any]:
        quote_id = require_text(payload, "quote_id")
        with self._lock:
            quote = self.quotes.get(quote_id)
            if quote is None:
                raise ValueError("Quote not found")
            if any(order["quote_id"] == quote_id for order in self.orders.values()):
                raise ValueError("An order already exists for this quote")
            if quote["status"] != SalesStatus.APPROVED:
                raise ValueError("Quote must be approved before creating an order")
            order_id = self._new_id("order")
            order = {
                "order_id": order_id,
                "quote_id": quote_id,
                "customer_id": quote["customer_id"],
                "product_id": quote["product_id"],
                "quantity": quote["quantity"],
                "total": quote["total"],
                "status": "recorded",
                "external_system_updated": False,
            }
            self.orders[order_id] = order
            quote["status"] = SalesStatus.ORDERED
            return dict(order)

    def get_quote(self, payload: dict[str, Any]) -> dict[str, Any]:
        quote_id = require_text(payload, "quote_id")
        with self._lock:
            quote = self.quotes.get(quote_id)
            if quote is None:
                raise ValueError("Quote not found")
            return dict(quote)

    def pipeline_summary(self, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        with self._lock:
            counts = {status.value: 0 for status in SalesStatus}
            value_by_status = {status.value: 0.0 for status in SalesStatus}
            for quote in self.quotes.values():
                status = quote["status"].value
                counts[status] += 1
                value_by_status[status] += quote["total"]
            return {
                "quote_count": len(self.quotes),
                "order_count": len(self.orders),
                "quote_count_by_status": counts,
                "quote_value_by_status": {
                    key: round(value, 2) for key, value in value_by_status.items()
                },
                "order_value": round(
                    sum(order["total"] for order in self.orders.values()), 2
                ),
            }


