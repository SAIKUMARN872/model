"""Request intelligence models for automatic ModelNow routing."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Tuple


@dataclass(frozen=True)
class RoutingRequirements:
    """Requirements inferred from a user prompt and its context."""

    complexity: float = 0.0
    quality_requirement: float = 0.5
    cost_sensitivity: float = 0.5
    latency_sensitivity: float = 0.5

    context_tokens: int = 0

    reasoning_required: bool = False
    coding_required: bool = False
    agentic_required: bool = False
    long_context_required: bool = False
    streaming_required: bool = False

    required_capabilities: Tuple[str, ...] = field(default_factory=tuple)

    quality_weight: float = 0.5
    cost_weight: float = 0.25
    latency_weight: float = 0.25

    preferred_tier: str | None = None

    def __post_init__(self) -> None:
        """Validate routing requirement ranges."""

        numeric_fields = {
            "complexity": self.complexity,
            "quality_requirement": self.quality_requirement,
            "cost_sensitivity": self.cost_sensitivity,
            "latency_sensitivity": self.latency_sensitivity,
            "quality_weight": self.quality_weight,
            "cost_weight": self.cost_weight,
            "latency_weight": self.latency_weight,
        }

        for name, value in numeric_fields.items():
            if not 0.0 <= value <= 1.0:
                raise ValueError(f"{name} must be between 0.0 and 1.0")

        if self.context_tokens < 0:
            raise ValueError("context_tokens cannot be negative")

        weight_sum = (
            self.quality_weight
            + self.cost_weight
            + self.latency_weight
        )

        if abs(weight_sum - 1.0) > 1e-6:
            raise ValueError(
                "quality_weight + cost_weight + latency_weight must equal 1.0"
            )

        if self.preferred_tier is not None:
            allowed_tiers = {"slm", "mlm", "llm"}

            if self.preferred_tier not in allowed_tiers:
                raise ValueError(
                    f"preferred_tier must be one of {sorted(allowed_tiers)}"
                )
