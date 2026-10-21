from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any


class HRAction(StrEnum):
    CREATE_EMPLOYEE = "create_employee"
    CREATE_CANDIDATE = "create_candidate"
    SCREEN_CANDIDATE = "screen_candidate"
    SCHEDULE_INTERVIEW = "schedule_interview"
    RECORD_INTERVIEW = "record_interview"
    REQUEST_ONBOARDING = "request_onboarding"
    APPROVE_ONBOARDING = "approve_onboarding"
    SUBMIT_LEAVE_REQUEST = "submit_leave_request"
    REVIEW_LEAVE_REQUEST = "review_leave_request"
    RECORD_ATTENDANCE = "record_attendance"
    RECORD_PERFORMANCE_REVIEW = "record_performance_review"


class HRStatus(StrEnum):
    CREATED = "created"
    UNDER_REVIEW = "under_review"
    SHORTLISTED = "shortlisted"
    NOT_SHORTLISTED = "not_shortlisted"
    SCHEDULED = "scheduled"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    RECORDED = "recorded"
    PENDING_INTEGRATION = "pending_integration"


@dataclass
class HRRecord:
    record_id: str
    record_type: str
    data: dict[str, Any] = field(default_factory=dict)
    status: str = HRStatus.CREATED


def require_text(payload: dict[str, Any], key: str) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"'{key}' is required and must be non-empty text")
    return value.strip()


def require_mapping(payload: Any, field_name: str = "payload") -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValueError(f"{field_name} must be an object")
    return payload
