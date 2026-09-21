from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass
class Heartbeat:
    """
    Lightweight heartbeat state for a model/provider health monitor.
    """

    name: str
    last_seen: datetime | None = None
    consecutive_failures: int = 0

    def __post_init__(self) -> None:
        if not isinstance(self.name, str):
            raise TypeError("name must be a string")

        if not self.name.strip():
            raise ValueError("name cannot be empty")

        if self.consecutive_failures < 0:
            raise ValueError(
                "consecutive_failures cannot be negative"
            )

    def mark_alive(
        self,
        when: datetime | None = None,
    ) -> None:
        self.last_seen = when or datetime.now(timezone.utc)
        self.consecutive_failures = 0

    def mark_failure(self) -> None:
        self.consecutive_failures += 1

    @property
    def alive(self) -> bool:
        return self.last_seen is not None

    def age_seconds(
        self,
        now: datetime | None = None,
    ) -> float | None:
        if self.last_seen is None:
            return None

        current = now or datetime.now(timezone.utc)

        return max(
            0.0,
            (current - self.last_seen).total_seconds(),
        )


__all__ = ["Heartbeat"]
