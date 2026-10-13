from dataclasses import dataclass
from enum import StrEnum
from typing import Any


class ERPStatus(StrEnum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


class ERPAction(StrEnum):
    ADD_SUPPLIER = "add_supplier"
    CREATE_ITEM = "create_item"
    GET_ITEM = "get_item"
    LIST_ITEMS = "list_items"
    CREATE_REQUISITION = "create_requisition"
    APPROVE_REQUISITION = "approve_requisition"
    CREATE_PURCHASE_ORDER = "create_purchase_order"
    RECEIVE_GOODS = "receive_goods"
    MOVE_STOCK = "move_stock"


def require_text(payload: dict[str, Any], key: str) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"'{key}' is required and must be non-empty text")
    return value.strip()


def require_positive_number(payload: dict[str, Any], key: str) -> float:
    value = payload.get(key)
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"'{key}' must be a positive number")
    if value <= 0:
        raise ValueError(f"'{key}' must be a positive number")
    return float(value)


@dataclass(frozen=True)
class ERPConfig:
    domain: str = "erp"
    require_requisition_approval: bool = True
    require_po_approval: bool = True
    external_integrations_enabled: bool = False


DEFAULT_ERP_CONFIG = ERPConfig()
