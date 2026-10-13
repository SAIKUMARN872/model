"""Recommendation engine for ModelNow optimization."""

from __future__ import annotations

from threading import RLock
from typing import Any, Iterable, Mapping, Optional

from .rules import RecommendationRule, RuleEvaluation
from .suggestions import RecommendationSuggestion, SuggestionBuilder

__all__ = [
    "RecommendationEngine",
    "create_recommendation_engine",
]


class RecommendationEngine:
    """Evaluate optimization rules and generate actionable recommendations."""

    def __init__(
        self,
        rules: Optional[Iterable[RecommendationRule]] = None,
        suggestion_builder: Optional[SuggestionBuilder] = None,
        max_history: int = 1000,
    ) -> None:
        if isinstance(max_history, bool) or max_history < 1:
            raise ValueError("max_history must be at least 1")

        self.suggestion_builder = suggestion_builder or SuggestionBuilder()
        self.max_history = max_history
        self._rules: dict[str, RecommendationRule] = {}
        self._history: list[RecommendationSuggestion] = []
        self._lock = RLock()

        if rules:
            for rule in rules:
                self.register_rule(rule)

    def register_rule(self, rule: RecommendationRule) -> RecommendationRule:
        """Register or replace a recommendation rule."""
        if not isinstance(rule, RecommendationRule):
            raise TypeError("rule must be a RecommendationRule")

        with self._lock:
            self._rules[rule.rule_id] = rule

        return rule

    def register_rules(
        self,
        rules: Iterable[RecommendationRule],
    ) -> int:
        """Register multiple rules."""
        items = list(rules)
        for rule in items:
            self.register_rule(rule)
        return len(items)

    def remove_rule(self, rule_id: str) -> bool:
        """Remove a rule by identifier."""
        with self._lock:
            return self._rules.pop(rule_id, None) is not None

    def get_rule(self, rule_id: str) -> Optional[RecommendationRule]:
        """Return a registered rule."""
        with self._lock:
            return self._rules.get(rule_id)

    def rules(self) -> list[RecommendationRule]:
        """Return registered rules ordered by priority."""
        with self._lock:
            return sorted(
                self._rules.values(),
                key=lambda item: (-item.priority, item.rule_id),
            )

    def evaluate(
        self,
        context: Mapping[str, Any],
    ) -> list[RuleEvaluation]:
        """Evaluate all registered rules against a context."""
        evaluations: list[RuleEvaluation] = []

        for rule in self.rules():
            matched = rule.evaluate(context)

            if matched:
                reason = (
                    f"Rule '{rule.name}' matched field "
                    f"'{rule.field}' with operator '{rule.operator.value}'."
                )
            else:
                reason = (
                    f"Rule '{rule.name}' did not match field "
                    f"'{rule.field}'."
                )

            evaluations.append(
                RuleEvaluation(
                    rule_id=rule.rule_id,
                    matched=matched,
                    recommendation_type=rule.recommendation_type,
                    priority=rule.priority,
                    reason=reason,
                    metadata=rule.metadata,
                )
            )

        return evaluations

    def recommend(
        self,
        context: Mapping[str, Any],
    ) -> list[RecommendationSuggestion]:
        """Generate recommendations from matching rules."""
        recommendations: list[RecommendationSuggestion] = []

        for evaluation in self.evaluate(context):
            if not evaluation.matched:
                continue

            rule = self.get_rule(evaluation.rule_id)
            if rule is None:
                continue

            suggestion = self._suggest_from_rule(rule, context)
            if suggestion is not None:
                recommendations.append(suggestion)

        recommendations.sort(
            key=lambda item: (
                -item.priority,
                -item.confidence,
                -item.expected_impact,
                item.suggestion_id,
            )
        )

        with self._lock:
            self._history.extend(recommendations)
            if len(self._history) > self.max_history:
                self._history = self._history[-self.max_history :]

        return recommendations

    def _suggest_from_rule(
        self,
        rule: RecommendationRule,
        context: Mapping[str, Any],
    ) -> Optional[RecommendationSuggestion]:
        """Translate a matching rule into a concrete suggestion."""
        recommendation_type = rule.recommendation_type.lower()

        model = context.get("model")
        provider = context.get("provider")

        if recommendation_type == "cost":
            current = context.get("current_cost", context.get("cost"))
            recommended = context.get(
                "recommended_cost",
                context.get("target_cost"),
            )
            if current is not None and recommended is not None and model and provider:
                return self.suggestion_builder.cost(
                    model=str(model),
                    provider=str(provider),
                    current_cost=current,
                    recommended_cost=recommended,
                    confidence=context.get("confidence", "0.8"),
                )

        if recommendation_type == "latency":
            current = context.get(
                "current_latency_ms",
                context.get("latency_ms"),
            )
            recommended = context.get(
                "recommended_latency_ms",
                context.get("target_latency_ms"),
            )
            if (
                current is not None
                and recommended is not None
                and model
                and provider
            ):
                return self.suggestion_builder.latency(
                    model=str(model),
                    provider=str(provider),
                    current_latency_ms=current,
                    recommended_latency_ms=recommended,
                    confidence=context.get("confidence", "0.8"),
                )

        if recommendation_type == "quality":
            current = context.get(
                "current_quality",
                context.get("quality"),
            )
            recommended = context.get(
                "recommended_quality",
                context.get("target_quality"),
            )
            if (
                current is not None
                and recommended is not None
                and model
                and provider
            ):
                return self.suggestion_builder.quality(
                    model=str(model),
                    provider=str(provider),
                    current_quality=current,
                    recommended_quality=recommended,
                    confidence=context.get("confidence", "0.8"),
                )

        return self.suggestion_builder.build(
            recommendation_type=rule.recommendation_type,
            title=rule.name,
            description=(
                f"Optimization rule '{rule.name}' recommends reviewing "
                f"the current configuration."
            ),
            priority=rule.priority,
            confidence=context.get("confidence", "0.8"),
            action=context.get(
                "recommended_action",
                rule.metadata.get("action"),
            ),
            model=str(model) if model is not None else None,
            provider=str(provider) if provider is not None else None,
            metadata={
                **dict(rule.metadata),
                "rule_id": rule.rule_id,
            },
        )

    def history(self) -> list[RecommendationSuggestion]:
        """Return recommendation history."""
        with self._lock:
            return list(self._history)

    def clear_history(self) -> None:
        """Clear recommendation history."""
        with self._lock:
            self._history.clear()

    def clear_rules(self) -> None:
        """Remove all registered rules."""
        with self._lock:
            self._rules.clear()

    def __len__(self) -> int:
        with self._lock:
            return len(self._rules)


def create_recommendation_engine(
    rules: Optional[Iterable[RecommendationRule]] = None,
    max_history: int = 1000,
) -> RecommendationEngine:
    """Create a configured recommendation engine."""
    return RecommendationEngine(
        rules=rules,
        max_history=max_history,
    )
