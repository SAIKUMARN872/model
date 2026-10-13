from __future__ import annotations

from decimal import Decimal

from .models import QuotaAccount


DEFAULT_WARNING_THRESHOLD = Decimal("0.80")
DEFAULT_CRITICAL_THRESHOLD = Decimal("0.95")


class QuotaPolicy:
    """Defines quota warning and enforcement thresholds."""

    def __init__(
        self,
        warning_threshold: Decimal = DEFAULT_WARNING_THRESHOLD,
        critical_threshold: Decimal = DEFAULT_CRITICAL_THRESHOLD,
    ) -> None:
        self.warning_threshold = Decimal(str(warning_threshold))
        self.critical_threshold = Decimal(str(critical_threshold))

        if not (
            Decimal("0")
            < self.warning_threshold
            < self.critical_threshold
            <= Decimal("1")
        ):
            raise ValueError(
                "Thresholds must satisfy "
                "0 < warning < critical <= 1"
            )

    def projected_utilization(
        self,
        quota: QuotaAccount,
        requested: int,
    ) -> Decimal:
        if requested < 0:
            raise ValueError(
                "Requested usage cannot be negative"
            )

        projected = quota.used + requested

        if quota.limit <= 0:
            raise ValueError(
                "Quota limit must be greater than zero"
            )

        return Decimal(projected) / Decimal(quota.limit)

    def is_exceeded(
        self,
        quota: QuotaAccount,
        requested: int,
    ) -> bool:
        return quota.used + requested > quota.limit

    def is_critical(
        self,
        quota: QuotaAccount,
        requested: int,
    ) -> bool:
        return (
            self.projected_utilization(quota, requested)
            >= self.critical_threshold
        )

    def is_warning(
        self,
        quota: QuotaAccount,
        requested: int,
    ) -> bool:
        utilization = self.projected_utilization(
            quota,
            requested,
        )

        return (
            self.warning_threshold
            <= utilization
            < self.critical_threshold
        )


__all__ = [
    "QuotaPolicy",
    "DEFAULT_WARNING_THRESHOLD",
    "DEFAULT_CRITICAL_THRESHOLD",
]
