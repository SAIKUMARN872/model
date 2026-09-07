"""
Quota enforcement policies.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class QuotaDecision(str, Enum):
    """
    Result of quota evaluation.
    """

    ALLOW = "allow"
    WARN = "warn"
    THROTTLE = "throttle"
    QUEUE = "queue"
    BLOCK = "block"


class QuotaAction(str, Enum):
    """
    Action to take after quota evaluation.
    """

    CONTINUE = "continue"
    WARN = "warn"
    THROTTLE = "throttle"
    QUEUE = "queue"
    BLOCK = "block"


@dataclass(frozen=True)
class QuotaPolicy:
    """
    Controls quota behavior.
    """

    name: str = "default"

    warning_threshold_percent: float = 80.0
    throttle_threshold_percent: float = 90.0
    block_threshold_percent: float = 100.0

    on_warning: QuotaAction = QuotaAction.WARN
    on_throttle: QuotaAction = QuotaAction.THROTTLE
    on_exceeded: QuotaAction = QuotaAction.BLOCK

    enable_throttling: bool = True
    enable_queueing: bool = True

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        thresholds = (
            self.warning_threshold_percent,
            self.throttle_threshold_percent,
            self.block_threshold_percent,
        )

        for threshold in thresholds:
            if threshold < 0:
                raise ValueError(
                    "Quota thresholds cannot be negative"
                )

        if not (
            self.warning_threshold_percent
            <= self.throttle_threshold_percent
            <= self.block_threshold_percent
        ):
            raise ValueError(
                "Quota thresholds must be ordered"
            )


@dataclass(frozen=True)
class QuotaEvaluation:
    """
    Result of evaluating quota utilization.
    """

    decision: QuotaDecision
    action: QuotaAction

    utilization_percent: float

    requests_used: int
    requests_limit: int | None

    tokens_used: int
    tokens_limit: int | None

    reason: str

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


class QuotaPolicyEngine:
    """
    Evaluates quota usage against a policy.
    """

    def __init__(
        self,
        policy: QuotaPolicy | None = None,
    ) -> None:

        self.policy = (
            policy or QuotaPolicy()
        )

    def evaluate(
        self,
        requests_used: int,
        requests_limit: int | None,
        tokens_used: int,
        tokens_limit: int | None,
    ) -> QuotaEvaluation:

        request_utilization = self._utilization(
            requests_used,
            requests_limit,
        )

        token_utilization = self._utilization(
            tokens_used,
            tokens_limit,
        )

        utilization = max(
            request_utilization,
            token_utilization,
        )

        if utilization >= (
            self.policy.block_threshold_percent
        ):

            return QuotaEvaluation(
                decision=QuotaDecision.BLOCK,
                action=self.policy.on_exceeded,
                utilization_percent=utilization,
                requests_used=requests_used,
                requests_limit=requests_limit,
                tokens_used=tokens_used,
                tokens_limit=tokens_limit,
                reason="Quota limit exceeded",
            )

        if (
            utilization
            >= self.policy.throttle_threshold_percent
        ):

            if (
                self.policy.enable_throttling
                and self.policy.on_throttle
                == QuotaAction.THROTTLE
            ):

                return QuotaEvaluation(
                    decision=QuotaDecision.THROTTLE,
                    action=QuotaAction.THROTTLE,
                    utilization_percent=utilization,
                    requests_used=requests_used,
                    requests_limit=requests_limit,
                    tokens_used=tokens_used,
                    tokens_limit=tokens_limit,
                    reason="Quota throttle threshold reached",
                )

        if (
            utilization
            >= self.policy.warning_threshold_percent
        ):

            return QuotaEvaluation(
                decision=QuotaDecision.WARN,
                action=self.policy.on_warning,
                utilization_percent=utilization,
                requests_used=requests_used,
                requests_limit=requests_limit,
                tokens_used=tokens_used,
                tokens_limit=tokens_limit,
                reason="Quota warning threshold reached",
            )

        return QuotaEvaluation(
            decision=QuotaDecision.ALLOW,
            action=QuotaAction.CONTINUE,
            utilization_percent=utilization,
            requests_used=requests_used,
            requests_limit=requests_limit,
            tokens_used=tokens_used,
            tokens_limit=tokens_limit,
            reason="Quota available",
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