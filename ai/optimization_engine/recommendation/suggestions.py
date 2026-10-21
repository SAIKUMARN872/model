"""Recommendation suggestion models and builders."""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Mapping, Optional

__all__ = [
    "RecommendationSeverity",
    "RecommendationSuggestion",
    "SuggestionBuilder",
]


class RecommendationSeverity(str):
    """Severity levels for optimization recommendations."""

    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass(frozen=True)
class RecommendationSuggestion:
    """A concrete optimization recommendation."""

    suggestion_id: str
    recommendation_type: str
    title: str
    description: str
    severity: str = RecommendationSeverity.INFO
    priority: int = 0
    expected_impact: Decimal = Decimal("0")
    confidence: Decimal = Decimal("0")
    action: Optional[str] = None
    model: Optional[str] = None
    provider: Optional[str] = None
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.suggestion_id.strip():
            raise ValueError("suggestion_id must not be empty")
        if not self.recommendation_type.strip():
            raise ValueError("recommendation_type must not be empty")
        if not self.title.strip():
            raise ValueError("title must not be empty")
        if not self.description.strip():
            raise ValueError("description must not be empty")
        if self.priority < 0:
            raise ValueError("priority must be non-negative")

        impact = Decimal(str(self.expected_impact))
        confidence = Decimal(str(self.confidence))

        if not impact.is_finite():
            raise ValueError("expected_impact must be finite")
        if not confidence.is_finite() or not Decimal("0") <= confidence <= Decimal("1"):
            raise ValueError("confidence must be between 0 and 1")

        object.__setattr__(self, "expected_impact", impact)
        object.__setattr__(self, "confidence", confidence)
        object.__setattr__(self, "metadata", dict(self.metadata))

    def as_dict(self) -> dict[str, Any]:
        """Serialize the suggestion."""
        return {
            "suggestion_id": self.suggestion_id,
            "recommendation_type": self.recommendation_type,
            "title": self.title,
            "description": self.description,
            "severity": self.severity,
            "priority": self.priority,
            "expected_impact": str(self.expected_impact),
            "confidence": str(self.confidence),
            "action": self.action,
            "model": self.model,
            "provider": self.provider,
            "metadata": dict(self.metadata),
        }


class SuggestionBuilder:
    """Build standardized optimization recommendations."""

    def __init__(self, prefix: str = "recommendation") -> None:
        prefix = str(prefix).strip()
        if not prefix:
            raise ValueError("prefix must not be empty")
        self.prefix = prefix

    def build(
        self,
        *,
        recommendation_type: str,
        title: str,
        description: str,
        severity: str = RecommendationSeverity.INFO,
        priority: int = 0,
        expected_impact: Decimal | float | int = Decimal("0"),
        confidence: Decimal | float | int = Decimal("0"),
        action: Optional[str] = None,
        model: Optional[str] = None,
        provider: Optional[str] = None,
        metadata: Optional[Mapping[str, Any]] = None,
        suggestion_id: Optional[str] = None,
    ) -> RecommendationSuggestion:
        """Build one recommendation suggestion."""
        if suggestion_id is None:
            suggestion_id = self._make_id(
                recommendation_type,
                model,
                provider,
                title,
            )

        return RecommendationSuggestion(
            suggestion_id=suggestion_id,
            recommendation_type=recommendation_type,
            title=title,
            description=description,
            severity=severity,
            priority=priority,
            expected_impact=Decimal(str(expected_impact)),
            confidence=Decimal(str(confidence)),
            action=action,
            model=model,
            provider=provider,
            metadata=metadata or {},
        )

    def cost(
        self,
        *,
        model: str,
        provider: str,
        current_cost: Decimal | float | int,
        recommended_cost: Decimal | float | int,
        confidence: Decimal | float | int = Decimal("0.8"),
    ) -> RecommendationSuggestion:
        """Create a cost optimization recommendation."""
        current = Decimal(str(current_cost))
        recommended = Decimal(str(recommended_cost))
        savings = current - recommended
        impact = savings / current if current > 0 else Decimal("0")

        return self.build(
            recommendation_type="cost",
            title="Reduce model execution cost",
            description=(
                f"Consider routing traffic from {model} to a lower-cost "
                f"option when quality requirements remain satisfied. "
                f"Estimated savings: {savings}."
            ),
            severity=(
                RecommendationSeverity.HIGH
                if impact >= Decimal("0.30")
                else RecommendationSeverity.MEDIUM
            ),
            priority=80,
            expected_impact=impact,
            confidence=confidence,
            action="evaluate_lower_cost_model",
            model=model,
            provider=provider,
            metadata={
                "current_cost": str(current),
                "recommended_cost": str(recommended),
                "estimated_savings": str(savings),
            },
        )

    def latency(
        self,
        *,
        model: str,
        provider: str,
        current_latency_ms: Decimal | float | int,
        recommended_latency_ms: Decimal | float | int,
        confidence: Decimal | float | int = Decimal("0.8"),
    ) -> RecommendationSuggestion:
        """Create a latency optimization recommendation."""
        current = Decimal(str(current_latency_ms))
        recommended = Decimal(str(recommended_latency_ms))
        reduction = current - recommended
        impact = reduction / current if current > 0 else Decimal("0")

        return self.build(
            recommendation_type="latency",
            title="Reduce model response latency",
            description=(
                f"Consider a faster model/provider route for {model}. "
                f"Estimated latency reduction: {reduction} ms."
            ),
            severity=(
                RecommendationSeverity.HIGH
                if impact >= Decimal("0.30")
                else RecommendationSeverity.MEDIUM
            ),
            priority=75,
            expected_impact=impact,
            confidence=confidence,
            action="evaluate_faster_route",
            model=model,
            provider=provider,
            metadata={
                "current_latency_ms": str(current),
                "recommended_latency_ms": str(recommended),
                "estimated_reduction_ms": str(reduction),
            },
        )

    def quality(
        self,
        *,
        model: str,
        provider: str,
        current_quality: Decimal | float | int,
        recommended_quality: Decimal | float | int,
        confidence: Decimal | float | int = Decimal("0.8"),
    ) -> RecommendationSuggestion:
        """Create a quality optimization recommendation."""
        current = Decimal(str(current_quality))
        recommended = Decimal(str(recommended_quality))
        improvement = recommended - current

        return self.build(
            recommendation_type="quality",
            title="Improve response quality",
            description=(
                f"Consider routing quality-sensitive requests to a stronger "
                f"model or provider. Estimated quality improvement: {improvement}."
            ),
            severity=(
                RecommendationSeverity.HIGH
                if improvement >= Decimal("0.15")
                else RecommendationSeverity.MEDIUM
            ),
            priority=90,
            expected_impact=improvement,
            confidence=confidence,
            action="evaluate_higher_quality_model",
            model=model,
            provider=provider,
            metadata={
                "current_quality": str(current),
                "recommended_quality": str(recommended),
                "estimated_improvement": str(improvement),
            },
        )

    def _make_id(
        self,
        recommendation_type: str,
        model: Optional[str],
        provider: Optional[str],
        title: str,
    ) -> str:
        """Create a stable identifier from recommendation attributes."""
        import hashlib

        raw = "|".join(
            [
                recommendation_type,
                model or "",
                provider or "",
                title,
            ]
        )
        digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]
        return f"{self.prefix}-{digest}"
