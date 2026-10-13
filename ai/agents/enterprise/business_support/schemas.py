from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any


class TicketPriority(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TicketStatus(StrEnum):
    OPEN = "open"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    AWAITING_CUSTOMER = "awaiting_customer"
    ESCALATED = "escalated"
    RESOLVED = "resolved"
    CLOSED = "closed"


@dataclass
class SupportTicket:
    ticket_id: str
    subject: str
    description: str
    category: str
    priority: str
    customer_id: str | None = None
    assignee: str | None = None
    status: str = TicketStatus.OPEN
    response_draft: str | None = None
    escalation_reason: str | None = None
    resolution: str | None = None
    history: list[dict[str, Any]] = field(default_factory=list)


def require_text(payload: dict[str, Any], key: str) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"'{key}' is required and must be non-empty text")
    return value.strip()


def validate_priority(value: Any) -> str:
    if not isinstance(value, str):
        raise ValueError("priority must be a string")
    try:
        return TicketPriority(value.strip().lower()).value
    except ValueError:
        raise ValueError(
            "priority must be low, medium, high, or critical"
        ) from None
