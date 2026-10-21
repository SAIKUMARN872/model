from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from enum import Enum
from typing import Any, Dict


class RoutingOptimizationObjective(str, Enum):
    """Routing optimization objectives."""

    COST = "cost"
    LATENCY = "latency"
    QUALITY = "quality"
    BALANCED = "balanced"


@dataclass(frozen=True)
class RoutingOptimizationPolicy:
    """Policy controlling routing optimization."""

    objective: RoutingOptimizationObjective = (
        RoutingOptimizationObjective.BALANCED
    )

    cost_weight: Decimal = Decimal("0.33")
    latency_weight: Decimal = Decimal("0.33")
    quality_weight: Decimal = Decimal("0.34")

    minimum_quality: Decimal = Decimal("0")
    maximum_cost: Decimal | None = None
    maximum_latency_ms: Decimal | None = None

    allow_model_switch: bool = True
    allow_provider_switch: bool = True

    metadata: Dict[str, Any] | None = None

    def __post_init__(self) -> None:
        weights = (
            self.cost_weight,
            self.latency_weight,
            self.quality_weight,
        )

        for weight in weights:
            if weight < Decimal("0"):
                raise ValueError(
                    "routing weights must not be negative"
                )

        total = sum(weights)

        if total <= Decimal("0"):
            raise ValueError(
                "routing weights must have a positive total"
            )

        if (
            self.minimum_quality < Decimal("0")
            or self.minimum_quality > Decimal("1")
        ):
            raise ValueError(
                "minimum_quality must be between 0 and 1"
            )

        if (
            self.maximum_cost is not None
            and self.maximum_cost < Decimal("0")
        ):
            raise ValueError(
                "maximum_cost must not be negative"
            )

        if (
            self.maximum_latency_ms is not None
            and self.maximum_latency_ms < Decimal("0")
        ):
            raise ValueError(
                "maximum_latency_ms must not be negative"
            )

    def normalized_weights(self) -> Dict[str, Decimal]:
        """Return normalized routing weights."""
        total = (
            self.cost_weight
            + self.latency_weight
            + self.quality_weight
        )

        return {
            "cost": self.cost_weight / total,
            "latency": self.latency_weight / total,
            "quality": self.quality_weight / total,
        }

    def allows_model_switch(self) -> bool:
        """Return whether model switching is allowed."""
        return self.allow_model_switch

    def allows_provider_switch(self) -> bool:
        """Return whether provider switching is allowed."""
        return self.allow_provider_switch

    def constraints(self) -> Dict[str, Any]:
        """Return policy constraints."""
        return {
            "minimum_quality": self.minimum_quality,
            "maximum_cost": self.maximum_cost,
            "maximum_latency_ms": self.maximum_latency_ms,
        }


def create_balanced_policy() -> RoutingOptimizationPolicy:
    """Create a balanced routing policy."""
    return RoutingOptimizationPolicy(
        objective=RoutingOptimizationObjective.BALANCED,
        cost_weight=Decimal("0.33"),
        latency_weight=Decimal("0.33"),
        quality_weight=Decimal("0.34"),
    )


def create_cost_policy() -> RoutingOptimizationPolicy:
    """Create a cost-focused routing policy."""
    return RoutingOptimizationPolicy(
        objective=RoutingOptimizationObjective.COST,
        cost_weight=Decimal("0.70"),
        latency_weight=Decimal("0.20"),
        quality_weight=Decimal("0.10"),
    )


def create_latency_policy() -> RoutingOptimizationPolicy:
    """Create a latency-focused routing policy."""
    return RoutingOptimizationPolicy(
        objective=RoutingOptimizationObjective.LATENCY,
        cost_weight=Decimal("0.15"),
        latency_weight=Decimal("0.70"),
        quality_weight=Decimal("0.15"),
    )


def create_quality_policy() -> RoutingOptimizationPolicy:
    """Create a quality-focused routing policy."""
    return RoutingOptimizationPolicy(
        objective=RoutingOptimizationObjective.QUALITY,
        cost_weight=Decimal("0.10"),
        latency_weight=Decimal("0.15"),
        quality_weight=Decimal("0.75"),
    )


__all__ = [
    "RoutingOptimizationObjective",
    "RoutingOptimizationPolicy",
    "create_balanced_policy",
    "create_cost_policy",
    "create_latency_policy",
    "create_quality_policy",
]
