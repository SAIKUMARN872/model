from __future__ import annotations

from typing import Optional

from .exceptions import QuotaExceededError, QuotaNotFoundError
from .manager import QuotaManager
from .models import QuotaUsage


class QuotaTracker:
    """Tracks and queries quota consumption."""

    def __init__(self, manager: QuotaManager) -> None:
        self.manager = manager

    def record(
        self,
        quota_id: str,
        amount: int,
        request_id: Optional[str] = None,
        model: Optional[str] = None,
        provider: Optional[str] = None,
    ) -> QuotaUsage:
        if self.manager.get_quota(quota_id) is None:
            raise QuotaNotFoundError(
                f"Quota not found: {quota_id}"
            )

        try:
            return self.manager.consume(
                quota_id=quota_id,
                amount=amount,
                request_id=request_id,
                model=model,
                provider=provider,
            )
        except QuotaExceededError:
            raise

    def get_usage(
        self,
        quota_id: str,
    ) -> int:
        if self.manager.get_quota(quota_id) is None:
            raise QuotaNotFoundError(
                f"Quota not found: {quota_id}"
            )

        return self.manager.get_used(quota_id)

    def get_remaining(
        self,
        quota_id: str,
    ) -> int:
        if self.manager.get_quota(quota_id) is None:
            raise QuotaNotFoundError(
                f"Quota not found: {quota_id}"
            )

        return self.manager.get_remaining(quota_id)

    def get_utilization(
        self,
        quota_id: str,
    ):
        if self.manager.get_quota(quota_id) is None:
            raise QuotaNotFoundError(
                f"Quota not found: {quota_id}"
            )

        return self.manager.get_utilization(quota_id)

    def list_records(
        self,
        quota_id: Optional[str] = None,
    ) -> tuple[QuotaUsage, ...]:
        return self.manager.list_usage(quota_id)


__all__ = ["QuotaTracker"]
