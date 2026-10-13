from enum import StrEnum


class EnterpriseDomain(StrEnum):
    BUSINESS_SUPPORT = "business_support"
    CRM = "crm"
    CUSTOM = "custom"
    ERP = "erp"
    FINANCE = "finance"
    HR = "hr"
    SALES = "sales"


class EnterpriseTaskStatus(StrEnum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    AWAITING_APPROVAL = "awaiting_approval"


class ApprovalStatus(StrEnum):
    NOT_REQUIRED = "not_required"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
