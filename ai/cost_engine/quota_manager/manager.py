"""
Main quota manager.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from .policies import (
    QuotaAction,
    QuotaDecision,
    QuotaEvaluation,
    QuotaPolicy,
    QuotaPolicyEngine,
)
from .quotas import (
    QuotaLimit,
    QuotaPeriod,
    QuotaStore,
    QuotaUsage,
)
from .validator import (
    QuotaValidationResult,
    QuotaValidator,
)


@dataclass(frozen=True)
class QuotaCheckRequest:
    """
    Represents a proposed quota-consuming request.
    """

    scope_id: str

    requests: int = 1
    tokens: int = 0

    input_tokens: int = 0
    output_tokens: int = 0

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if not self.scope_id:
            raise ValueError(
                "scope_id cannot be empty"
            )

        values = (
            self.requests,
            self.tokens,
            self.input_tokens,
            self.output_tokens,
        )

        if any(value < 0 for value in values):
            raise ValueError(
                "Quota request values cannot be negative"
            )


@dataclass(frozen=True)
class QuotaCheckResult:
    """
    Complete quota check result.
    """

    allowed: bool

    scope_id: str

    decision: QuotaDecision
    action: QuotaAction

    validation: QuotaValidationResult

    usage: QuotaUsage

    limit: QuotaLimit

    checked_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


@dataclass(frozen=True)
class QuotaStatus:
    """
    Current quota status.
    """

    scope_id: str

    period: QuotaPeriod

    enabled: bool

    requests_used: int
    requests_reserved: int
    requests_limit: int | None
    requests_remaining: int | None

    tokens_used: int
    tokens_reserved: int
    tokens_limit: int | None
    tokens_remaining: int | None

    utilization_percent: float

    period_started_at: datetime
    updated_at: datetime

    def to_dict(self) -> dict[str, Any]:

        return {
            "scope_id": self.scope_id,
            "period": self.period.value,
            "enabled": self.enabled,
            "requests_used": self.requests_used,
            "requests_reserved": self.requests_reserved,
            "requests_limit": self.requests_limit,
            "requests_remaining": self.requests_remaining,
            "tokens_used": self.tokens_used,
            "tokens_reserved": self.tokens_reserved,
            "tokens_limit": self.tokens_limit,
            "tokens_remaining": self.tokens_remaining,
            "utilization_percent": (
                self.utilization_percent
            ),
            "period_started_at": (
                self.period_started_at.isoformat()
            ),
            "updated_at": (
                self.updated_at.isoformat()
            ),
        }


class QuotaManager:
    """
    Central quota management service.

    Responsibilities:

    - create/update quotas
    - validate requests
    - reserve quota
    - release reservations
    - commit actual usage
    - inspect quota status
    - reset quota periods
    """

    def __init__(
        self,
        store: QuotaStore | None = None,
        policy: QuotaPolicy | None = None,
        validator: QuotaValidator | None = None,
    ) -> None:

        self.store = (
            store or QuotaStore()
        )

        self.policy_engine = (
            QuotaPolicyEngine(
                policy=policy
            )
        )

        self.validator = (
            validator
            or QuotaValidator(
                policy_engine=self.policy_engine
            )
        )

    def create_quota(
        self,
        scope_id: str,
        max_requests: int | None = None,
        max_tokens: int | None = None,
        max_input_tokens: int | None = None,
        max_output_tokens: int | None = None,
        period: QuotaPeriod = QuotaPeriod.DAY,
        enabled: bool = True,
        metadata: dict[str, Any] | None = None,
    ) -> QuotaLimit:

        limit = QuotaLimit(
            scope_id=scope_id,
            max_requests=max_requests,
            max_tokens=max_tokens,
            max_input_tokens=max_input_tokens,
            max_output_tokens=max_output_tokens,
            period=period,
            enabled=enabled,
            metadata=metadata or {},
        )

        return self.store.set_limit(
            limit
        )

    def update_quota(
        self,
        scope_id: str,
        max_requests: int | None = None,
        max_tokens: int | None = None,
        max_input_tokens: int | None = None,
        max_output_tokens: int | None = None,
        period: QuotaPeriod | None = None,
        enabled: bool | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> QuotaLimit:

        current = self.store.require_limit(
            scope_id
        )

        updated = QuotaLimit(
            scope_id=scope_id,
            max_requests=(
                max_requests
                if max_requests is not None
                else current.max_requests
            ),
            max_tokens=(
                max_tokens
                if max_tokens is not None
                else current.max_tokens
            ),
            max_input_tokens=(
                max_input_tokens
                if max_input_tokens is not None
                else current.max_input_tokens
            ),
            max_output_tokens=(
                max_output_tokens
                if max_output_tokens is not None
                else current.max_output_tokens
            ),
            period=(
                period
                if period is not None
                else current.period
            ),
            enabled=(
                enabled
                if enabled is not None
                else current.enabled
            ),
            metadata=(
                metadata
                if metadata is not None
                else current.metadata
            ),
        )

        return self.store.set_limit(
            updated
        )

    def check(
        self,
        request: QuotaCheckRequest,
    ) -> QuotaCheckResult:

        limit = self.store.require_limit(
            request.scope_id
        )

        usage = self.store.get_usage(
            request.scope_id
        )

        validation = self.validator.validate(
            limit=limit,
            usage=usage,
            requested_requests=request.requests,
            requested_tokens=request.tokens,
        )

        return QuotaCheckResult(
            allowed=validation.allowed,
            scope_id=request.scope_id,
            decision=validation.decision,
            action=validation.action,
            validation=validation,
            usage=usage,
            limit=limit,
            metadata=request.metadata,
        )

    def reserve(
        self,
        request: QuotaCheckRequest,
    ) -> QuotaUsage:

        result = self.check(request)

        if not result.allowed:
            raise PermissionError(
                result.validation.reason
            )

        return self.store.reserve(
            scope_id=request.scope_id,
            requests=request.requests,
            tokens=request.tokens,
        )

    def release(
        self,
        request: QuotaCheckRequest,
    ) -> QuotaUsage:

        return self.store.release(
            scope_id=request.scope_id,
            requests=request.requests,
            tokens=request.tokens,
        )

    def commit(
        self,
        request: QuotaCheckRequest,
    ) -> QuotaUsage:

        return self.store.commit(
            scope_id=request.scope_id,
            requests=request.requests,
            tokens=request.tokens,
            input_tokens=request.input_tokens,
            output_tokens=request.output_tokens,
        )

    def status(
        self,
        scope_id: str,
    ) -> QuotaStatus:

        limit = self.store.require_limit(
            scope_id
        )

        usage = self.store.get_usage(
            scope_id
        )

        effective_requests = (
            usage.effective_requests
        )

        effective_tokens = (
            usage.effective_tokens
        )

        requests_remaining = self._remaining(
            limit.max_requests,
            effective_requests,
        )

        tokens_remaining = self._remaining(
            limit.max_tokens,
            effective_tokens,
        )

        request_utilization = (
            self._utilization(
                effective_requests,
                limit.max_requests,
            )
        )

        token_utilization = (
            self._utilization(
                effective_tokens,
                limit.max_tokens,
            )
        )

        utilization = max(
            request_utilization,
            token_utilization,
        )

        return QuotaStatus(
            scope_id=scope_id,
            period=limit.period,
            enabled=limit.enabled,
            requests_used=usage.requests,
            requests_reserved=(
                usage.reserved_requests
            ),
            requests_limit=limit.max_requests,
            requests_remaining=requests_remaining,
            tokens_used=usage.tokens,
            tokens_reserved=(
                usage.reserved_tokens
            ),
            tokens_limit=limit.max_tokens,
            tokens_remaining=tokens_remaining,
            utilization_percent=utilization,
            period_started_at=(
                usage.period_started_at
            ),
            updated_at=usage.updated_at,
        )

    def reset(
        self,
        scope_id: str,
    ) -> QuotaUsage:

        self.store.require_limit(
            scope_id
        )

        return self.store.reset(
            scope_id
        )

    def delete(
        self,
        scope_id: str,
    ) -> bool:

        # QuotaStore currently intentionally does not
        # expose deletion. Disable the quota instead.
        current = self.store.require_limit(
            scope_id
        )

        self.store.set_limit(
            QuotaLimit(
                scope_id=current.scope_id,
                max_requests=current.max_requests,
                max_tokens=current.max_tokens,
                max_input_tokens=(
                    current.max_input_tokens
                ),
                max_output_tokens=(
                    current.max_output_tokens
                ),
                period=current.period,
                enabled=False,
                metadata=current.metadata,
            )
        )

        return True

    def all_statuses(
        self,
    ) -> list[QuotaStatus]:

        return [
            self.status(scope_id)
            for scope_id
            in self.store.all_limits()
        ]

    @staticmethod
    def _remaining(
        limit: int | None,
        used: int,
    ) -> int | None:

        if limit is None:
            return None

        return max(
            0,
            limit - used,
        )

    @staticmethod
    def _utilization(
        used: int,
        limit: int | None,
    ) -> float:

        if limit is None or limit <= 0:
            return 0.0

        return (
            float(used)
            / float(limit)
            * 100.0
        )