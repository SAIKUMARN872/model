from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from threading import RLock
from typing import Protocol

from .constants import EnterpriseDomain, EnterpriseTaskStatus
from .exceptions import EnterpriseValidationError
from .utils import validate_identifier, validate_non_empty_text


@dataclass(frozen=True)
class EnterpriseAuditEvent:
    task_id: str
    domain: EnterpriseDomain
    action: str
    status: EnterpriseTaskStatus
    timestamp: datetime
    actor_id: str | None = None
    error_type: str | None = None

    def __post_init__(self) -> None:
        object.__setattr__(
            self, "task_id", validate_identifier(self.task_id, "task_id")
        )
        if not isinstance(self.domain, EnterpriseDomain):
            raise EnterpriseValidationError("domain must be an EnterpriseDomain.")
        object.__setattr__(
            self, "action", validate_non_empty_text(self.action, "action")
        )
        if not isinstance(self.status, EnterpriseTaskStatus):
            raise EnterpriseValidationError(
                "status must be an EnterpriseTaskStatus."
            )
        if not isinstance(self.timestamp, datetime):
            raise EnterpriseValidationError("timestamp must be a datetime.")
        if self.timestamp.tzinfo is None:
            raise EnterpriseValidationError("timestamp must be timezone-aware.")
        if self.actor_id is not None:
            object.__setattr__(
                self, "actor_id", validate_identifier(self.actor_id, "actor_id")
            )
        if self.error_type is not None:
            object.__setattr__(
                self, "error_type",
                validate_non_empty_text(self.error_type, "error_type"),
            )


class EnterpriseAuditLog(Protocol):
    def record(self, event: EnterpriseAuditEvent) -> None:
        ...

    def list_events(
        self, task_id: str | None = None
    ) -> tuple[EnterpriseAuditEvent, ...]:
        ...


class InMemoryEnterpriseAuditLog:
    """Thread-safe, process-local audit log for development and testing."""

    def __init__(self) -> None:
        self._lock = RLock()
        self._events: list[EnterpriseAuditEvent] = []

    def record(self, event: EnterpriseAuditEvent) -> None:
        if not isinstance(event, EnterpriseAuditEvent):
            raise EnterpriseValidationError(
                "event must be an EnterpriseAuditEvent."
            )
        with self._lock:
            self._events.append(event)

    def list_events(
        self, task_id: str | None = None
    ) -> tuple[EnterpriseAuditEvent, ...]:
        if task_id is not None:
            task_id = validate_identifier(task_id, "task_id")
        with self._lock:
            events = tuple(self._events)
        if task_id is None:
            return events
        return tuple(event for event in events if event.task_id == task_id)


def make_audit_event(
    task_id: str,
    domain: EnterpriseDomain,
    action: str,
    status: EnterpriseTaskStatus,
    actor_id: str | None = None,
    error_type: str | None = None,
) -> EnterpriseAuditEvent:
    return EnterpriseAuditEvent(
        task_id=task_id,
        domain=domain,
        action=action,
        status=status,
        timestamp=datetime.now(timezone.utc),
        actor_id=actor_id,
        error_type=error_type,
    )
