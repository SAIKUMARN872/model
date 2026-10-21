from __future__ import annotations

from typing import Dict, Optional

from .exceptions import (
    InvalidQuotaRequestError,
    QuotaExceededError,
    QuotaNotFoundError,
)
from .models import QuotaAccount, QuotaCheck, QuotaUsage
from .policies import QuotaPolicy
from .utils import (
    calculate_remaining,
    calculate_utilization,
    normalize_period,
    normalize_unit,
    validate_quota_limit,
    validate_usage_amount,
)


class QuotaManager:
    """Creates, checks, and tracks usage quotas."""

    def __init__(
        self,
        policy: Optional[QuotaPolicy] = None,
    ) -> None:
        self.policy = policy or QuotaPolicy()
        self._quotas: Dict[str, QuotaAccount] = {}
        self._usage_records: list[QuotaUsage] = []

    def create_quota(
        self,
        quota_id: str,
        limit: int,
        unit: str = "tokens",
        owner_id: Optional[str] = None,
        period: str = "monthly",
    ) -> QuotaAccount:
        if not quota_id or not quota_id.strip():
            raise InvalidQuotaRequestError(
                "quota_id cannot be empty"
            )

        if quota_id in self._quotas:
            raise InvalidQuotaRequestError(
                f"Quota already exists: {quota_id}"
            )

        limit = validate_quota_limit(limit)
        unit = normalize_unit(unit)
        period = normalize_period(period)

        quota = QuotaAccount(
            quota_id=quota_id,
            limit=limit,
            unit=unit,
            owner_id=owner_id,
            period=period,
        )

        self._quotas[quota_id] = quota

        return quota

    def get_quota(
        self,
        quota_id: str,
    ) -> QuotaAccount | None:
        return self._quotas.get(quota_id)

    def require_quota(
        self,
        quota_id: str,
    ) -> QuotaAccount:
        quota = self.get_quota(quota_id)

        if quota is None:
            raise QuotaNotFoundError(
                f"Quota not found: {quota_id}"
            )

        return quota

    def check(
        self,
        quota_id: str,
        requested: int,
    ) -> QuotaCheck:
        quota = self.require_quota(quota_id)

        requested = validate_usage_amount(requested)

        projected = quota.used + requested

        remaining = calculate_remaining(
            quota.limit,
            quota.used,
            requested,
        )

        utilization = calculate_utilization(
            quota.limit,
            quota.used,
            requested,
        )

        exceeded = projected > quota.limit

        return QuotaCheck(
            quota_id=quota.quota_id,
            limit=quota.limit,
            used=quota.used,
            requested=requested,
            remaining=remaining,
            utilization=utilization,
            exceeded=exceeded,
        )

    def consume(
        self,
        quota_id: str,
        amount: int,
        request_id: Optional[str] = None,
        model: Optional[str] = None,
        provider: Optional[str] = None,
    ) -> QuotaUsage:
        quota = self.require_quota(quota_id)

        amount = validate_usage_amount(amount)

        if amount == 0:
            raise InvalidQuotaRequestError(
                "Usage amount must be greater than zero"
            )

        check = self.check(
            quota_id=quota_id,
            requested=amount,
        )

        if check.exceeded:
            raise QuotaExceededError(
                f"Quota exceeded: {quota_id}"
            )

        quota.record_usage(amount)

        usage = QuotaUsage(
            quota_id=quota_id,
            amount=amount,
            request_id=request_id,
            model=model,
            provider=provider,
        )

        self._usage_records.append(usage)

        return usage

    def get_used(
        self,
        quota_id: str,
    ) -> int:
        return self.require_quota(quota_id).used

    def get_remaining(
        self,
        quota_id: str,
    ) -> int:
        return self.require_quota(quota_id).remaining

    def get_utilization(
        self,
        quota_id: str,
    ):
        return self.require_quota(quota_id).utilization

    def list_quotas(self) -> tuple[QuotaAccount, ...]:
        return tuple(self._quotas.values())

    def list_usage(
        self,
        quota_id: Optional[str] = None,
    ) -> tuple[QuotaUsage, ...]:
        if quota_id is None:
            return tuple(self._usage_records)

        return tuple(
            record
            for record in self._usage_records
            if record.quota_id == quota_id
        )


__all__ = ["QuotaManager"]
