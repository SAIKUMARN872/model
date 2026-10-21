from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass(frozen=True)
class PricingVersion:
    version: str
    created_at: datetime
    effective_from: datetime
    effective_until: datetime | None = None
    description: str = ""

    def __post_init__(self) -> None:
        if not self.version or not self.version.strip():
            raise ValueError("Pricing version cannot be empty")

        if self.effective_until is not None:
            if self.effective_until < self.effective_from:
                raise ValueError(
                    "effective_until cannot precede effective_from"
                )

    def is_effective_at(self, moment: datetime) -> bool:
        if moment.tzinfo is None or moment.utcoffset() is None:
            raise ValueError("moment must be timezone-aware")

        start = self.effective_from
        end = self.effective_until

        if start.tzinfo is None or start.utcoffset() is None:
            raise ValueError("effective_from must be timezone-aware")

        if end is not None and (
            end.tzinfo is None or end.utcoffset() is None
        ):
            raise ValueError("effective_until must be timezone-aware")

        return start <= moment and (end is None or moment < end)

    @classmethod
    def create(
        cls,
        version: str,
        effective_from: datetime | None = None,
        effective_until: datetime | None = None,
        description: str = "",
    ) -> "PricingVersion":
        now = datetime.now(timezone.utc)

        return cls(
            version=version,
            created_at=now,
            effective_from=effective_from or now,
            effective_until=effective_until,
            description=description,
        )


__all__ = ["PricingVersion"]
