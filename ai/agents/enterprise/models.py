from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .constants import ApprovalStatus, EnterpriseDomain, EnterpriseTaskStatus
from .exceptions import EnterpriseValidationError
from .utils import validate_identifier, validate_metadata, validate_non_empty_text


@dataclass(frozen=True)
class EnterpriseAgentConfig:
    domain: EnterpriseDomain
    name: str
    description: str = ""
    enabled: bool = True
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not isinstance(self.domain, EnterpriseDomain):
            raise EnterpriseValidationError("domain must be an EnterpriseDomain.")
        object.__setattr__(self, "name", validate_non_empty_text(self.name, "name"))
        if not isinstance(self.description, str):
            raise EnterpriseValidationError("description must be a string.")
        if not isinstance(self.enabled, bool):
            raise EnterpriseValidationError("enabled must be a boolean.")
        object.__setattr__(self, "metadata", validate_metadata(self.metadata))


@dataclass(frozen=True)
class EnterpriseTask:
    task_id: str
    domain: EnterpriseDomain
    action: str
    payload: dict[str, Any] = field(default_factory=dict)
    status: EnterpriseTaskStatus = EnterpriseTaskStatus.PENDING
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        object.__setattr__(self, "task_id", validate_identifier(self.task_id, "task_id"))
        if not isinstance(self.domain, EnterpriseDomain):
            raise EnterpriseValidationError("domain must be an EnterpriseDomain.")
        object.__setattr__(self, "action", validate_non_empty_text(self.action, "action"))
        if not isinstance(self.payload, dict):
            raise EnterpriseValidationError("payload must be a dictionary.")
        if not isinstance(self.status, EnterpriseTaskStatus):
            raise EnterpriseValidationError("status must be an EnterpriseTaskStatus.")
        object.__setattr__(self, "payload", dict(self.payload))
        object.__setattr__(self, "metadata", validate_metadata(self.metadata))


@dataclass(frozen=True)
class ApprovalRequest:
    approval_id: str
    action: str
    reason: str
    status: ApprovalStatus = ApprovalStatus.PENDING
    requested_by: str | None = None

    def __post_init__(self) -> None:
        object.__setattr__(
            self, "approval_id", validate_identifier(self.approval_id, "approval_id")
        )
        object.__setattr__(self, "action", validate_non_empty_text(self.action, "action"))
        object.__setattr__(self, "reason", validate_non_empty_text(self.reason, "reason"))
        if not isinstance(self.status, ApprovalStatus):
            raise EnterpriseValidationError("status must be an ApprovalStatus.")
        if self.requested_by is not None:
            object.__setattr__(
                self, "requested_by",
                validate_identifier(self.requested_by, "requested_by")
            )
