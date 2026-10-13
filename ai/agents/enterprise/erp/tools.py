from __future__ import annotations

from threading import RLock
from typing import Any
from uuid import uuid4

from .schemas import (
    ERPStatus,
    require_positive_number,
    require_text,
)


class ERPTools:
    """In-memory ERP operations; no external ERP is contacted."""

    def __init__(self) -> None:
        self._lock = RLock()
        self.suppliers: dict[str, dict[str, Any]] = {}
        self.items: dict[str, dict[str, Any]] = {}
        self.requisitions: dict[str, dict[str, Any]] = {}
        self.purchase_orders: dict[str, dict[str, Any]] = {}
        self.stock_movements: list[dict[str, Any]] = []

    @staticmethod
    def _new_id(prefix: str) -> str:
        return f"{prefix}_{uuid4().hex[:12]}"

    def add_supplier(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = require_text(payload, "name")
        with self._lock:
            supplier_id = self._new_id("supplier")
            supplier = {
                "supplier_id": supplier_id,
                "name": name,
                "email": payload.get("email"),
                "status": "active",
            }
            self.suppliers[supplier_id] = supplier
            return dict(supplier)

    def create_item(self, payload: dict[str, Any]) -> dict[str, Any]:
        sku = require_text(payload, "sku")
        name = require_text(payload, "name")
        quantity = payload.get("quantity", 0)
        if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 0:
            raise ValueError("quantity must be a non-negative integer")
        reorder_level = payload.get("reorder_level", 0)
        if (
            isinstance(reorder_level, bool)
            or not isinstance(reorder_level, int)
            or reorder_level < 0
        ):
            raise ValueError("reorder_level must be a non-negative integer")

        with self._lock:
            if any(item["sku"] == sku for item in self.items.values()):
                raise ValueError(f"SKU already exists: {sku}")
            item_id = self._new_id("item")
            item = {
                "item_id": item_id,
                "sku": sku,
                "name": name,
                "quantity": quantity,
                "reorder_level": reorder_level,
            }
            self.items[item_id] = item
            return dict(item)

    def get_item(self, payload: dict[str, Any]) -> dict[str, Any]:
        item_id = require_text(payload, "item_id")
        with self._lock:
            item = self.items.get(item_id)
            if item is None:
                raise ValueError("Item not found")
            return dict(item)

    def list_items(self) -> list[dict[str, Any]]:
        with self._lock:
            return [dict(item) for item in self.items.values()]

    def create_requisition(self, payload: dict[str, Any]) -> dict[str, Any]:
        item_id = require_text(payload, "item_id")
        quantity = require_positive_number(payload, "quantity")
        if not quantity.is_integer():
            raise ValueError("quantity must be a whole number")
        with self._lock:
            if item_id not in self.items:
                raise ValueError("Item not found")
            requisition_id = self._new_id("req")
            record = {
                "requisition_id": requisition_id,
                "item_id": item_id,
                "quantity": int(quantity),
                "reason": payload.get("reason", ""),
                "status": ERPStatus.PENDING_APPROVAL,
                "approval_note": None,
            }
            self.requisitions[requisition_id] = record
            return dict(record)

    def approve_requisition(self, payload: dict[str, Any]) -> dict[str, Any]:
        requisition_id = require_text(payload, "requisition_id")
        decision = require_text(payload, "decision").lower()
        if decision not in {"approve", "reject"}:
            raise ValueError("decision must be 'approve' or 'reject'")
        note = payload.get("note", "")
        with self._lock:
            record = self.requisitions.get(requisition_id)
            if record is None:
                raise ValueError("Requisition not found")
            if record["status"] != ERPStatus.PENDING_APPROVAL:
                raise ValueError("Requisition is not awaiting approval")
            record["status"] = (
                ERPStatus.APPROVED if decision == "approve" else ERPStatus.REJECTED
            )
            record["approval_note"] = note
            return dict(record)

    def create_purchase_order(self, payload: dict[str, Any]) -> dict[str, Any]:
        requisition_id = require_text(payload, "requisition_id")
        supplier_id = require_text(payload, "supplier_id")
        unit_price = require_positive_number(payload, "unit_price")
        with self._lock:
            requisition = self.requisitions.get(requisition_id)
            if requisition is None:
                raise ValueError("Requisition not found")
            if requisition["status"] != ERPStatus.APPROVED:
                raise ValueError("Requisition must be approved before ordering")
            if supplier_id not in self.suppliers:
                raise ValueError("Supplier not found")
            if any(
                po["requisition_id"] == requisition_id
                for po in self.purchase_orders.values()
            ):
                raise ValueError("A purchase order already exists for this requisition")
            po_id = self._new_id("po")
            order = {
                "purchase_order_id": po_id,
                "requisition_id": requisition_id,
                "supplier_id": supplier_id,
                "item_id": requisition["item_id"],
                "quantity": requisition["quantity"],
                "unit_price": unit_price,
                "total": round(unit_price * requisition["quantity"], 2),
                "status": ERPStatus.PENDING_APPROVAL,
                "received_quantity": 0,
            }
            self.purchase_orders[po_id] = order
            return dict(order)

    def approve_purchase_order(self, payload: dict[str, Any]) -> dict[str, Any]:
        po_id = require_text(payload, "purchase_order_id")
        decision = require_text(payload, "decision").lower()
        if decision not in {"approve", "reject"}:
            raise ValueError("decision must be 'approve' or 'reject'")
        with self._lock:
            order = self.purchase_orders.get(po_id)
            if order is None:
                raise ValueError("Purchase order not found")
            if order["status"] != ERPStatus.PENDING_APPROVAL:
                raise ValueError("Purchase order is not awaiting approval")
            order["status"] = (
                ERPStatus.APPROVED if decision == "approve" else ERPStatus.REJECTED
            )
            return dict(order)

    def receive_goods(self, payload: dict[str, Any]) -> dict[str, Any]:
        po_id = require_text(payload, "purchase_order_id")
        quantity = require_positive_number(payload, "quantity")
        if not quantity.is_integer():
            raise ValueError("quantity must be a whole number")
        quantity = int(quantity)
        with self._lock:
            order = self.purchase_orders.get(po_id)
            if order is None:
                raise ValueError("Purchase order not found")
            if order["status"] not in {ERPStatus.APPROVED, ERPStatus.COMPLETED}:
                raise ValueError("Purchase order must be approved before goods receipt")
            remaining = order["quantity"] - order["received_quantity"]
            if quantity > remaining:
                raise ValueError("Received quantity exceeds outstanding order quantity")
            item = self.items[order["item_id"]]
            item["quantity"] += quantity
            order["received_quantity"] += quantity
            if order["received_quantity"] == order["quantity"]:
                order["status"] = ERPStatus.COMPLETED
            self.stock_movements.append({
                "movement_id": self._new_id("move"),
                "item_id": item["item_id"],
                "quantity": quantity,
                "type": "goods_receipt",
                "purchase_order_id": po_id,
            })
            return dict(order)

    def move_stock(self, payload: dict[str, Any]) -> dict[str, Any]:
        item_id = require_text(payload, "item_id")
        quantity = require_positive_number(payload, "quantity")
        if not quantity.is_integer():
            raise ValueError("quantity must be a whole number")
        quantity = int(quantity)
        direction = require_text(payload, "direction").lower()
        if direction not in {"in", "out"}:
            raise ValueError("direction must be 'in' or 'out'")
        with self._lock:
            item = self.items.get(item_id)
            if item is None:
                raise ValueError("Item not found")
            delta = quantity if direction == "in" else -quantity
            if item["quantity"] + delta < 0:
                raise ValueError("Insufficient stock")
            item["quantity"] += delta
            movement = {
                "movement_id": self._new_id("move"),
                "item_id": item_id,
                "quantity": delta,
                "type": "manual_stock_movement",
            }
            self.stock_movements.append(movement)
            return dict(movement)
