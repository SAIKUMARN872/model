from dataclasses import dataclass
from enum import StrEnum
from typing import Any


class FinanceStatus(StrEnum):
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    RECORDED = "recorded"


class InvoiceStatus(StrEnum):
    OPEN = "open"
    APPROVED = "approved"
    PARTIALLY_PAID = "partially_paid"
    PAID = "paid"
    REJECTED = "rejected"


def require_text(payload: dict[str, Any], key: str) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"'{key}' is required and must be non-empty text")
    return value.strip()


def require_amount(payload: dict[str, Any], key: str = "amount") -> float:
    value = payload.get(key)
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"'{key}' must be a positive number")
    if value <= 0:
        raise ValueError(f"'{key}' must be a positive number")
    return round(float(value), 2)


@dataclass(frozen=True)
class FinanceConfig:
    domain: str = "finance"
    require_expense_approval: bool = True
    require_invoice_approval: bool = True
    external_payments_enabled: bool = False


DEFAULT_FINANCE_CONFIG = FinanceConfig()
