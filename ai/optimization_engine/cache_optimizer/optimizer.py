from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Any, Callable

from .manager import CacheEntry, CacheManager
from .strategy import (
    CacheDecision,
    CacheRequestContext,
    CacheStrategy,
    CacheStrategyManager,
)
from .utils import make_cache_key


@dataclass(frozen=True)
class CacheOptimizationRequest:
    request: Any
    namespace: str = "modelnow"
    model: str | None = None
    provider: str | None = None
    confidence: Decimal = Decimal("1")
    streaming: bool = False
    uses_tools: bool = False
    dynamic_context: bool = False


@dataclass(frozen=True)
class CacheOptimizationResult:
    value: Any
    cache_hit: bool
    cache_stored: bool
    cache_key: str
    decision: CacheDecision
    entry: CacheEntry | None = None

    @property
    def optimized(self) -> bool:
        return self.cache_hit or self.cache_stored

    def as_dict(self) -> dict[str, Any]:
        return {
            "value": self.value,
            "cache_hit": self.cache_hit,
            "cache_stored": self.cache_stored,
            "cache_key": self.cache_key,
            "decision": {
                "should_cache": self.decision.should_cache,
                "reason": self.decision.reason,
                "strategy": self.decision.strategy.value,
            },
            "entry": (
                self.entry.as_dict()
                if self.entry is not None
                else None
            ),
            "optimized": self.optimized,
        }


class CacheOptimizer:
    def __init__(
        self,
        manager: CacheManager | None = None,
        strategy_manager: CacheStrategyManager | None = None,
    ) -> None:
        self.manager = (
            manager
            if manager is not None
            else CacheManager()
        )

        self.strategy_manager = (
            strategy_manager
            if strategy_manager is not None
            else CacheStrategyManager()
        )

    def build_key(
        self,
        request: CacheOptimizationRequest,
    ) -> str:
        return make_cache_key(
            request.request,
            namespace=request.namespace,
        )

    def lookup(
        self,
        request: CacheOptimizationRequest,
    ) -> CacheOptimizationResult | None:
        key = self.build_key(request)

        entry = self.manager.get_entry(key)

        if entry is None:
            return None

        context = CacheRequestContext(
            confidence=request.confidence,
            successful=True,
            streaming=request.streaming,
            uses_tools=request.uses_tools,
            dynamic_context=request.dynamic_context,
            response_size=len(
                str(entry.value)
            ),
        )

        decision = self.strategy_manager.decide(
            context
        )

        return CacheOptimizationResult(
            value=entry.value,
            cache_hit=True,
            cache_stored=False,
            cache_key=key,
            decision=decision,
            entry=entry,
        )

    def execute(
        self,
        request: CacheOptimizationRequest,
        executor: Callable[[], Any],
        *,
        successful: bool = True,
        response_size: int | None = None,
    ) -> CacheOptimizationResult:
        key = self.build_key(request)

        cached = self.lookup(request)

        if cached is not None:
            return cached

        value = executor()

        actual_response_size = (
            len(str(value))
            if response_size is None
            else response_size
        )

        context = CacheRequestContext(
            confidence=request.confidence,
            successful=successful,
            streaming=request.streaming,
            uses_tools=request.uses_tools,
            dynamic_context=request.dynamic_context,
            response_size=actual_response_size,
        )

        decision = self.strategy_manager.decide(
            context
        )

        entry = None
        cache_stored = False

        if (
            decision.should_cache
            and successful
        ):
            entry = self.manager.set(
                key=key,
                value=value,
                model=request.model,
                provider=request.provider,
                metadata={
                    "namespace": request.namespace,
                    "confidence": str(
                        request.confidence
                    ),
                    "strategy": (
                        decision.strategy.value
                    ),
                },
            )

            cache_stored = True

        return CacheOptimizationResult(
            value=value,
            cache_hit=False,
            cache_stored=cache_stored,
            cache_key=key,
            decision=decision,
            entry=entry,
        )

    def get_or_execute(
        self,
        request: CacheOptimizationRequest,
        executor: Callable[[], Any],
        *,
        successful: bool = True,
        response_size: int | None = None,
    ) -> CacheOptimizationResult:
        return self.execute(
            request,
            executor,
            successful=successful,
            response_size=response_size,
        )

    def invalidate(
        self,
        request: CacheOptimizationRequest,
    ) -> bool:
        key = self.build_key(request)

        return self.manager.invalidate(key)

    def clear(self) -> None:
        self.manager.clear()

    def statistics(self):
        return self.manager.statistics()

    def set_strategy(
        self,
        strategy: CacheStrategy,
    ) -> None:
        self.strategy_manager.set_strategy(
            strategy
        )


def create_cache_optimizer(
    manager: CacheManager | None = None,
    strategy_manager: CacheStrategyManager | None = None,
) -> CacheOptimizer:
    return CacheOptimizer(
        manager=manager,
        strategy_manager=strategy_manager,
    )


__all__ = [
    "CacheOptimizationRequest",
    "CacheOptimizationResult",
    "CacheOptimizer",
    "create_cache_optimizer",
]
