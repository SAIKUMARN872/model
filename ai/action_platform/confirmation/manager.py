"""Manage action confirmation verification and records."""

from __future__ import annotations

from threading import RLock
from typing import Any, Mapping

from .confirmation import ActionConfirmation, ActionConfirmationVerifier


class ActionConfirmationManager:
    """Verify and retain action confirmation records in memory.

    This manager does not execute actions or independently authenticate
    external providers. Provider evidence must be validated by a trusted
    integration before being treated as authoritative.
    """

    _TERMINAL_STATUSES = frozenset(
        {"confirmed", "failed", "cancelled", "canceled"}
    )

    def __init__(
        self,
        verifier: ActionConfirmationVerifier | None = None,
    ) -> None:
        self._verifier = verifier or ActionConfirmationVerifier()
        self._records: dict[str, ActionConfirmation] = {}
        self._lock = RLock()

    def verify_and_record(
        self,
        task_id: str,
        evidence: Mapping[str, Any],
    ) -> ActionConfirmation:
        """Verify evidence and store the result without replacing a terminal record."""
        if not isinstance(task_id, str) or not task_id.strip():
            raise ValueError("task_id must be a non-empty string.")
        if not isinstance(evidence, Mapping):
            raise TypeError("evidence must be a mapping.")

        with self._lock:
            existing = self._records.get(task_id)
            if existing and existing.status in self._TERMINAL_STATUSES:
                return existing

            result = self._verifier.verify(task_id, dict(evidence))
            self._records[task_id] = result
            return result

    def get(self, task_id: str) -> ActionConfirmation | None:
        """Return a recorded confirmation, or None when not found."""
        with self._lock:
            return self._records.get(task_id)

    def is_confirmed(self, task_id: str) -> bool:
        """Return whether the recorded action is confirmed."""
        with self._lock:
            record = self._records.get(task_id)
            return bool(record and record.confirmed)

    def remove(self, task_id: str) -> bool:
        """Remove a record. This does not undo or cancel the real-world action."""
        with self._lock:
            return self._records.pop(task_id, None) is not None

    def list_records(self) -> tuple[ActionConfirmation, ...]:
        """Return a stable snapshot of stored records."""
        with self._lock:
            return tuple(self._records.values())

    def clear(self) -> None:
        """Clear in-memory records; this does not alter external transactions."""
        with self._lock:
            self._records.clear()
