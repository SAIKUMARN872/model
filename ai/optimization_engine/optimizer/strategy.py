from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from .utils import normalize_weights


class OptimizationStrategy(str, Enum):
    COST = "cost"
    LATENCY = "latency"
    QUALITY = "quality"
    BALANCED = "balanced"


@dataclass(frozen=True)
class StrategyWeights:
    cost: float
    latency: float
    quality: float

    def as_dict(self) -> dict[str, float]:
        return {
            "cost": self.cost,
            "latency": self.latency,
            "quality": self.quality,
        }


@dataclass(frozen=True)
class OptimizationStrategyConfig:
    strategy: OptimizationStrategy
    weights: StrategyWeights


class StrategyManager:
    def __init__(self) -> None:
        self._configs = self._build_default_configs()

    @staticmethod
    def _build_default_configs() -> dict[
        OptimizationStrategy,
        OptimizationStrategyConfig,
    ]:
        return {
            OptimizationStrategy.COST: OptimizationStrategyConfig(
                strategy=OptimizationStrategy.COST,
                weights=StrategyWeights(
                    cost=0.80,
                    latency=0.10,
                    quality=0.10,
                ),
            ),
            OptimizationStrategy.LATENCY: OptimizationStrategyConfig(
                strategy=OptimizationStrategy.LATENCY,
                weights=StrategyWeights(
                    cost=0.10,
                    latency=0.80,
                    quality=0.10,
                ),
            ),
            OptimizationStrategy.QUALITY: OptimizationStrategyConfig(
                strategy=OptimizationStrategy.QUALITY,
                weights=StrategyWeights(
                    cost=0.05,
                    latency=0.05,
                    quality=0.90,
                ),
            ),
            OptimizationStrategy.BALANCED: OptimizationStrategyConfig(
                strategy=OptimizationStrategy.BALANCED,
                weights=StrategyWeights(
                    cost=0.33,
                    latency=0.33,
                    quality=0.34,
                ),
            ),
        }

    def get_config(
        self,
        strategy: OptimizationStrategy | str,
    ) -> OptimizationStrategyConfig:
        normalized = self._normalize_strategy(strategy)
        return self._configs[normalized]

    def get_weights(
        self,
        strategy: OptimizationStrategy | str,
    ) -> dict[str, float]:
        config = self.get_config(strategy)
        return config.weights.as_dict()

    def set_weights(
        self,
        strategy: OptimizationStrategy | str,
        weights: dict[str, float],
    ) -> OptimizationStrategyConfig:
        normalized = self._normalize_strategy(strategy)

        normalized_weights = normalize_weights(weights)

        cost = float(normalized_weights.get("cost", 0))
        latency = float(normalized_weights.get("latency", 0))
        quality = float(normalized_weights.get("quality", 0))

        total = cost + latency + quality

        if total <= 0:
            raise ValueError("strategy weights must contain a positive total")

        normalized_config = OptimizationStrategyConfig(
            strategy=normalized,
            weights=StrategyWeights(
                cost=cost / total,
                latency=latency / total,
                quality=quality / total,
            ),
        )

        self._configs[normalized] = normalized_config
        return normalized_config

    @staticmethod
    def _normalize_strategy(
        strategy: OptimizationStrategy | str,
    ) -> OptimizationStrategy:
        if isinstance(strategy, OptimizationStrategy):
            return strategy

        if not isinstance(strategy, str):
            raise TypeError("strategy must be an OptimizationStrategy or string")

        try:
            return OptimizationStrategy(strategy.lower().strip())
        except ValueError as exc:
            raise ValueError(
                f"unsupported optimization strategy: {strategy}"
            ) from exc


def create_default_strategy_manager() -> StrategyManager:
    return StrategyManager()
