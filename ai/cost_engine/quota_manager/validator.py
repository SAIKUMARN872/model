"""
Quota validation logic.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .policies import (
    QuotaAction,
    QuotaDecision,
    QuotaEvaluation,
    QuotaPolicyEngine,
)
from .quotas import (
    QuotaLimit,
    QuotaUsage,
)


class QuotaValidationError(ValueError):
    """Raised for invalid quota validation input."""


@dataclass(frozen=True)
class QuotaValidationResult:
    """
    Result of validating a proposed request.
    """

    allowed: bool

    decision: QuotaDecision
    action: QuotaAction

    scope_id: str

    requested_requests: int
    requested_tokens: int

    projected_requests: int
    projected_tokens: int

    remaining_requests: int | None
    remaining_tokens: int | None

    utilization_percent: float

    reason: str

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


class QuotaValidator:
    """
    Validates proposed usage against quota limits.
    """

    def __init__(
        self,
        policy_engine: QuotaPolicyEngine | None = None,
    ) -> None:

        self.policy_engine = (
            policy_engine
            or QuotaPolicyEngine()
        )

    def validate(
        self,
        limit: QuotaLimit,
        usage: QuotaUsage,
        requested_requests: int = 1,
        requested_tokens: int = 0,
    ) -> QuotaValidationResult:

        if requested_requests < 0:
            raise QuotaValidationError(
                "requested_requests cannot be negative"
            )

        if requested_tokens < 0:
            raise QuotaValidationError(
                "requested_tokens cannot be negative"
            )

        if not limit.enabled:

            return QuotaValidationResult(
                allowed=True,
                decision=QuotaDecision.ALLOW,
                action=QuotaAction.CONTINUE,
                scope_id=limit.scope_id,
                requested_requests=requested_requests,
                requested_tokens=requested_tokens,
                projected_requests=(
                    usage.effective_requests
                    + requested_requests
                ),
                projected_tokens=(
                    usage.effective_tokens
                    + requested_tokens
                ),
                remaining_requests=None,
                remaining_tokens=None,
                utilization_percent=0.0,
                reason="Quota disabled",
            )

        projected_requests = (
            usage.effective_requests
            + requested_requests
        )

        projected_tokens = (
            usage.effective_tokens
            + requested_tokens
        )

        remaining_requests = self._remaining(
            limit.max_requests,
            projected_requests,
        )

        remaining_tokens = self._remaining(
            limit.max_tokens,
            projected_tokens,
        )

        request_utilization = self._utilization(
            projected_requests,
            limit.max_requests,
        )

        token_utilization = self._utilization(
            projected_tokens,
            limit.max_tokens,
        )

        utilization = max(
            request_utilization,
            token_utilization,
        )

        exceeded = (
            (
                limit.max_requests is not None
                and projected_requests
                > limit.max_requests
            )
            or
            (
                limit.max_tokens is not None
                and projected_tokens
                > limit.max_tokens
            )
            or
            (
                limit.max_input_tokens is not None
                and usage.input_tokens
                > limit.max_input_tokens
            )
            or
            (
                limit.max_output_tokens is not None
                and usage.output_tokens
                > limit.max_output_tokens
            )
        )

        if exceeded:

            return QuotaValidationResult(
                allowed=False,
                decision=QuotaDecision.BLOCK,
                action=QuotaAction.BLOCK,
                scope_id=limit.scope_id,
                requested_requests=requested_requests,
                requested_tokens=requested_tokens,
                projected_requests=projected_requests,
                projected_tokens=projected_tokens,
                remaining_requests=remaining_requests,
                remaining_tokens=remaining_tokens,
                utilization_percent=utilization,
                reason="Quota exceeded",
            )

        evaluation = (
            self.policy_engine.evaluate(
                requests_used=projected_requests,
                requests_limit=limit.max_requests,
                tokens_used=projected_tokens,
                tokens_limit=limit.max_tokens,
            )
        )

        allowed = (
            evaluation.decision
            != QuotaDecision.BLOCK
        )

        return QuotaValidationResult(
            allowed=allowed,
            decision=evaluation.decision,
            action=evaluation.action,
            scope_id=limit.scope_id,
            requested_requests=requested_requests,
            requested_tokens=requested_tokens,
            projected_requests=projected_requests,
            projected_tokens=projected_tokens,
            remaining_requests=remaining_requests,
            remaining_tokens=remaining_tokens,
            utilization_percent=utilization,
            reason=evaluation.reason,
            metadata=evaluation.metadata,
        )

    @staticmethod
    def _remaining(
        limit: int | None,
        projected: int,
    ) -> int | None:

        if limit is None:
            return None

        return max(
            0,
            limit - projected,
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