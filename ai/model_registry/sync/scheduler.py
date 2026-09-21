from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone


@dataclass
class SyncSchedule:
    """
    Lightweight scheduling state for model synchronization.

    This class does not execute background jobs. It only determines
    when a synchronization is due.
    """

    interval_seconds: int = 3600
    last_run: datetime | None = None

    def __post_init__(self) -> None:
        if self.interval_seconds <= 0:
            raise ValueError(
                "interval_seconds must be greater than zero"
            )

    def mark_run(
        self,
        when: datetime | None = None,
    ) -> None:
        self.last_run = when or datetime.now(
            timezone.utc
        )

    def next_run(
        self,
        now: datetime | None = None,
    ) -> datetime:
        current = now or datetime.now(
            timezone.utc
        )

        if self.last_run is None:
            return current

        return self.last_run + timedelta(
            seconds=self.interval_seconds
        )

    def is_due(
        self,
        now: datetime | None = None,
    ) -> bool:
        current = now or datetime.now(
            timezone.utc
        )

        if self.last_run is None:
            return True

        return current >= self.next_run(current)

    def reset(self) -> None:
        self.last_run = None


__all__ = ["SyncSchedule"]
