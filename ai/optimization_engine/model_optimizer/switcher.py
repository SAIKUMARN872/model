from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Dict, Optional

from .selector import ModelSelection


@dataclass(frozen=True)
class ModelSwitchDecision:
    """Decision describing whether the model should change."""

    current_model: Optional[str]
    current_provider: Optional[str]
    selected_model: str
    selected_provider: str
    should_switch: bool
    cost_change: Optional[Decimal]
    latency_change_ms: Optional[Decimal]
    quality_change: Optional[Decimal]
    reason: str
    metadata: Dict[str, Any] = field(default_factory=dict)


class ModelSwitcher:
    """Determine whether switching models is beneficial."""

    def __init__(
        self,
        minimum_quality_improvement: Decimal = Decimal("0"),
        maximum_cost_increase: Optional[Decimal] = None,
        maximum_latency_increase_ms: Optional[Decimal] = None,
    ) -> None:
        if minimum_quality_improvement < Decimal("0"):
            raise ValueError(
                "minimum_quality_improvement must not be negative"
            )

        if (
            maximum_cost_increase is not None
            and maximum_cost_increase < Decimal("0")
        ):
            raise ValueError(
                "maximum_cost_increase must not be negative"
            )

        if (
            maximum_latency_increase_ms is not None
            and maximum_latency_increase_ms < Decimal("0")
        ):
            raise ValueError(
                "maximum_latency_increase_ms must not be negative"
            )

        self.minimum_quality_improvement = (
            minimum_quality_improvement
        )
        self.maximum_cost_increase = maximum_cost_increase
        self.maximum_latency_increase_ms = (
            maximum_latency_increase_ms
        )

    def evaluate(
        self,
        selection: ModelSelection,
        current_model: Optional[str],
        current_provider: Optional[str],
        current_cost: Optional[Decimal] = None,
        current_latency_ms: Optional[Decimal] = None,
        current_quality_score: Optional[Decimal] = None,
    ) -> ModelSwitchDecision:
        """Evaluate whether the selected model should replace the current one."""

        same_route = (
            current_model == selection.model
            and current_provider == selection.provider
        )

        if same_route:
            return ModelSwitchDecision(
                current_model=current_model,
                current_provider=current_provider,
                selected_model=selection.model,
                selected_provider=selection.provider,
                should_switch=False,
                cost_change=Decimal("0")
                if current_cost is not None
                else None,
                latency_change_ms=Decimal("0")
                if current_latency_ms is not None
                else None,
                quality_change=Decimal("0")
                if current_quality_score is not None
                else None,
                reason="selected model is already active",
            )

        cost_change = (
            selection.estimated_cost - current_cost
            if current_cost is not None
            else None
        )

        latency_change = (
            selection.estimated_latency_ms
            - current_latency_ms
            if current_latency_ms is not None
            else None
        )

        quality_change = (
            selection.quality_score - current_quality_score
            if current_quality_score is not None
            else None
        )

        if (
            quality_change is not None
            and quality_change
            < self.minimum_quality_improvement
        ):
            return ModelSwitchDecision(
                current_model=current_model,
                current_provider=current_provider,
                selected_model=selection.model,
                selected_provider=selection.provider,
                should_switch=False,
                cost_change=cost_change,
                latency_change_ms=latency_change,
                quality_change=quality_change,
                reason="quality improvement is below the required threshold",
            )

        if (
            cost_change is not None
            and self.maximum_cost_increase is not None
            and cost_change > self.maximum_cost_increase
        ):
            return ModelSwitchDecision(
                current_model=current_model,
                current_provider=current_provider,
                selected_model=selection.model,
                selected_provider=selection.provider,
                should_switch=False,
                cost_change=cost_change,
                latency_change_ms=latency_change,
                quality_change=quality_change,
                reason="cost increase exceeds the allowed threshold",
            )

        if (
            latency_change is not None
            and self.maximum_latency_increase_ms is not None
            and latency_change
            > self.maximum_latency_increase_ms
        ):
            return ModelSwitchDecision(
                current_model=current_model,
                current_provider=current_provider,
                selected_model=selection.model,
                selected_provider=selection.provider,
                should_switch=False,
                cost_change=cost_change,
                latency_change_ms=latency_change,
                quality_change=quality_change,
                reason="latency increase exceeds the allowed threshold",
            )

        if quality_change is not None and quality_change > Decimal("0"):
            reason = "switch improves model quality"
        elif cost_change is not None and cost_change < Decimal("0"):
            reason = "switch reduces model cost"
        elif (
            latency_change is not None
            and latency_change < Decimal("0")
        ):
            reason = "switch reduces model latency"
        else:
            reason = "selected model is preferred by the optimizer"

        return ModelSwitchDecision(
            current_model=current_model,
            current_provider=current_provider,
            selected_model=selection.model,
            selected_provider=selection.provider,
            should_switch=True,
            cost_change=cost_change,
            latency_change_ms=latency_change,
            quality_change=quality_change,
            reason=reason,
        )

    def should_switch(
        self,
        decision: ModelSwitchDecision,
    ) -> bool:
        """Return whether the decision requires a model switch."""
        return decision.should_switch


__all__ = [
    "ModelSwitchDecision",
    "ModelSwitcher",
]
