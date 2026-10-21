"""Enterprise action definitions for ModelNow."""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class EnterpriseActionType(str, Enum):
    BUSINESS_SUPPORT = "business_support"
    CRM = "crm"
    ERP = "erp"
    HR = "hr"
    SALES = "sales"
    FINANCE = "finance"
    CUSTOM = "custom"


class EnterpriseActionStatus(str, Enum):
    PENDING = "pending"
    AWAITING_APPROVAL = "awaiting_approval"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    REJECTED = "rejected"


@dataclass
class EnterpriseAction:
    """A requested operation against an enterprise system."""

    action_type: EnterpriseActionType
    operation: str
    payload: dict[str, Any] = field(default_factory=dict)
    action_id: str = ""
    requires_approval: bool = False
    metadata: dict[str, Any] = field(default_factory=dict)
