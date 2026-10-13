from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any


class CRMStage(StrEnum):
    CUSTOMER = "customer"
    LEAD = "lead"
    QUALIFICATION = "qualification"
    OPPORTUNITY = "opportunity"
    SALES_ASSIGNMENT = "sales_assignment"
    FOLLOW_UP = "follow_up"
    TEST_DRIVE = "test_drive"
    QUOTATION = "quotation"
    NEGOTIATION = "negotiation"
    APPROVAL = "approval"
    BOOKING = "booking"
    PAYMENT = "payment"
    INVOICE = "invoice"
    DELIVERY = "delivery"


class CRMStatus(StrEnum):
    CREATED = "created"
    QUALIFIED = "qualified"
    SCHEDULED = "scheduled"
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    BLOCKED = "blocked"
    PENDING_INTEGRATION = "pending_integration"
    COMPLETED = "completed"


@dataclass
class CRMRecord:
    record_id: str
    record_type: str
    data: dict[str, Any] = field(default_factory=dict)
    status: str = CRMStatus.CREATED


@dataclass
class CRMWorkflowState:
    workflow_id: str
    customer_id: str | None = None
    lead_id: str | None = None
    opportunity_id: str | None = None
    current_stage: str = CRMStage.CUSTOMER
    completed_stages: list[str] = field(default_factory=list)
    stage_results: list[dict[str, Any]] = field(default_factory=list)
    status: str = CRMStatus.CREATED


def require_text(payload: dict[str, Any], key: str) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"'{key}' is required and must be non-empty text")
    return value.strip()


def require_amount(payload: dict[str, Any], key: str) -> float:
    value = payload.get(key)
    if isinstance(value, bool):
        raise ValueError(f"'{key}' must be a positive number")
    try:
        amount = float(value)
    except (TypeError, ValueError):
        raise ValueError(f"'{key}' must be a positive number") from None
    if amount <= 0:
        raise ValueError(f"'{key}' must be a positive number")
    return amount
