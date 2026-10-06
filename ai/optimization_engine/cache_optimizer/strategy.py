from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from enum import Enum

from .utils import to_decimal, validate_ttl


class CacheStrategy(str, Enum):
    CONSERVATIVE = "conservative"
    BALANCED = "balanced"
    AGGRESSIVE = "aggressive"


@dataclass(frozen=True)
class CachePolicy:
    enabled: bool = True
    ttl_seconds: Decimal = Decimal("3600")
    min_confidence: Decimal = Decimal("0.90")
    cache_successful_only: bool = True
    min_response_size: int = 0
    namespace: str = "modelnow"
    bypass_on_streaming: bool = True
    bypass_on_tools: bool = True
    bypass_on_dynamic_context: bool = True

    def __post_init__(self) -> None:
        ttl = validate_ttl(self.ttl_seconds)

        confidence = to_decimal(
            self.min_confidence
        )

        if confidence < Decimal("0"):
            raise ValueError(
                "min_confidence cannot be negative"
            )

        if confidence > Decimal("1"):
            raise ValueError(
                "min_confidence cannot exceed 1"
            )

        if self.min_response_size < 0:
            raise ValueError(
                "min_response_size cannot be negative"
            )

        if not isinstance(self.namespace, str):
            raise TypeError(
                "namespace must be a string"
            )

        if not self.namespace.strip():
            raise ValueError(
                "namespace cannot be empty"
            )

        object.__setattr__(
            self,
            "ttl_seconds",
            ttl,
        )

        object.__setattr__(
            self,
            "min_confidence",
            confidence,
        )

        object.__setattr__(
            self,
            "namespace",
            self.namespace.strip(),
        )


@dataclass(frozen=True)
class CacheRequestContext:
    confidence: Decimal = Decimal("1")
    successful: bool = True
    streaming: bool = False
    uses_tools: bool = False
    dynamic_context: bool = False
    response_size: int = 0

    def __post_init__(self) -> None:
        confidence = to_decimal(
            self.confidence
        )

        if confidence < Decimal("0"):
            raise ValueError(
                "confidence cannot be negative"
            )

        if confidence > Decimal("1"):
            raise ValueError(
                "confidence cannot exceed 1"
            )

        if self.response_size < 0:
            raise ValueError(
                "response_size cannot be negative"
            )

        object.__setattr__(
            self,
            "confidence",
            confidence,
        )


@dataclass(frozen=True)
class CacheDecision:
    should_cache: bool
    reason: str
    strategy: CacheStrategy


class CacheStrategyManager:
    def __init__(
        self,
        strategy: CacheStrategy = CacheStrategy.BALANCED,
        policy: CachePolicy | None = None,
    ) -> None:
        self.strategy = CacheStrategy(strategy)

        self.policy = (
            policy
            if policy is not None
            else self._policy_for_strategy(
                self.strategy
            )
        )

    @staticmethod
    def _policy_for_strategy(
        strategy: CacheStrategy,
    ) -> CachePolicy:
        if strategy == CacheStrategy.CONSERVATIVE:
            return CachePolicy(
                ttl_seconds=Decimal("900"),
                min_confidence=Decimal("0.98"),
                cache_successful_only=True,
                min_response_size=1,
                bypass_on_streaming=True,
                bypass_on_tools=True,
                bypass_on_dynamic_context=True,
            )

        if strategy == CacheStrategy.AGGRESSIVE:
            return CachePolicy(
                ttl_seconds=Decimal("21600"),
                min_confidence=Decimal("0.75"),
                cache_successful_only=True,
                min_response_size=0,
                bypass_on_streaming=True,
                bypass_on_tools=False,
                bypass_on_dynamic_context=False,
            )

        return CachePolicy(
            ttl_seconds=Decimal("3600"),
            min_confidence=Decimal("0.90"),
            cache_successful_only=True,
            min_response_size=0,
            bypass_on_streaming=True,
            bypass_on_tools=True,
            bypass_on_dynamic_context=True,
        )

    def decide(
        self,
        context: CacheRequestContext,
    ) -> CacheDecision:
        if not self.policy.enabled:
            return CacheDecision(
                should_cache=False,
                reason="cache_disabled",
                strategy=self.strategy,
            )

        if (
            self.policy.cache_successful_only
            and not context.successful
        ):
            return CacheDecision(
                should_cache=False,
                reason="unsuccessful_response",
                strategy=self.strategy,
            )

        if (
            context.confidence
            < self.policy.min_confidence
        ):
            return CacheDecision(
                should_cache=False,
                reason="confidence_below_threshold",
                strategy=self.strategy,
            )

        if (
            self.policy.bypass_on_streaming
            and context.streaming
        ):
            return CacheDecision(
                should_cache=False,
                reason="streaming_response",
                strategy=self.strategy,
            )

        if (
            self.policy.bypass_on_tools
            and context.uses_tools
        ):
            return CacheDecision(
                should_cache=False,
                reason="tool_execution",
                strategy=self.strategy,
            )

        if (
            self.policy.bypass_on_dynamic_context
            and context.dynamic_context
        ):
            return CacheDecision(
                should_cache=False,
                reason="dynamic_context",
                strategy=self.strategy,
            )

        if (
            context.response_size
            < self.policy.min_response_size
        ):
            return CacheDecision(
                should_cache=False,
                reason="response_too_small",
                strategy=self.strategy,
            )

        return CacheDecision(
            should_cache=True,
            reason="eligible",
            strategy=self.strategy,
        )

    def update_policy(
        self,
        policy: CachePolicy,
    ) -> None:
        if not isinstance(policy, CachePolicy):
            raise TypeError(
                "policy must be a CachePolicy"
            )

        self.policy = policy

    def set_strategy(
        self,
        strategy: CacheStrategy,
    ) -> None:
        self.strategy = CacheStrategy(strategy)
        self.policy = self._policy_for_strategy(
            self.strategy
        )


def create_strategy_manager(
    strategy: CacheStrategy = CacheStrategy.BALANCED,
    policy: CachePolicy | None = None,
) -> CacheStrategyManager:
    return CacheStrategyManager(
        strategy=strategy,
        policy=policy,
    )


__all__ = [
    "CacheStrategy",
    "CachePolicy",
    "CacheRequestContext",
    "CacheDecision",
    "CacheStrategyManager",
    "create_strategy_manager",
]
