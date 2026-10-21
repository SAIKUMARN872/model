"""Regression tests for the recommendation package."""

from decimal import Decimal

from .engine import RecommendationEngine, create_recommendation_engine
from .rules import RecommendationRule, RuleOperator
from .suggestions import (
    RecommendationSeverity,
    RecommendationSuggestion,
    SuggestionBuilder,
)


def run_tests() -> None:
    # 1. Rule creation and evaluation.
    cost_rule = RecommendationRule(
        rule_id="cost-001",
        name="High cost",
        field="cost",
        operator=RuleOperator.GREATER_THAN,
        value=Decimal("0.10"),
        recommendation_type="cost",
        priority=80,
    )

    assert cost_rule.evaluate({"cost": Decimal("0.20")}) is True
    assert cost_rule.evaluate({"cost": Decimal("0.05")}) is False
    assert cost_rule.evaluate({}) is False
    assert cost_rule.as_dict()["operator"] == "greater_than"

    # 2. Additional rule operators.
    assert RecommendationRule(
        rule_id="eq",
        name="Equals",
        field="status",
        operator=RuleOperator.EQUALS,
        value="active",
    ).evaluate({"status": "active"})

    assert RecommendationRule(
        rule_id="contains",
        name="Contains",
        field="tags",
        operator=RuleOperator.CONTAINS,
        value="enterprise",
    ).evaluate({"tags": ["enterprise", "priority"]})

    assert RecommendationRule(
        rule_id="exists",
        name="Exists",
        field="model",
        operator=RuleOperator.EXISTS,
        value=True,
    ).evaluate({"model": "model-a"})

    # 3. Suggestion builder.
    builder = SuggestionBuilder()
    generic = builder.build(
        recommendation_type="routing",
        title="Review routing",
        description="Review model routing configuration.",
        priority=50,
        confidence=Decimal("0.9"),
    )

    assert isinstance(generic, RecommendationSuggestion)
    assert generic.confidence == Decimal("0.9")
    assert generic.as_dict()["recommendation_type"] == "routing"

    cost_suggestion = builder.cost(
        model="model-a",
        provider="provider-a",
        current_cost=Decimal("0.20"),
        recommended_cost=Decimal("0.10"),
    )
    assert cost_suggestion.recommendation_type == "cost"
    assert cost_suggestion.expected_impact == Decimal("0.5")
    assert cost_suggestion.severity == RecommendationSeverity.HIGH

    latency_suggestion = builder.latency(
        model="model-a",
        provider="provider-a",
        current_latency_ms=500,
        recommended_latency_ms=250,
    )
    assert latency_suggestion.expected_impact == Decimal("0.5")

    quality_suggestion = builder.quality(
        model="model-a",
        provider="provider-a",
        current_quality=0.70,
        recommended_quality=0.90,
    )
    assert quality_suggestion.expected_impact == Decimal("0.20")

    # 4. Engine registration and evaluation.
    engine = RecommendationEngine()
    assert len(engine) == 0

    engine.register_rule(cost_rule)
    engine.register_rule(
        RecommendationRule(
            rule_id="latency-001",
            name="High latency",
            field="latency_ms",
            operator=RuleOperator.GREATER_THAN,
            value=300,
            recommendation_type="latency",
            priority=70,
        )
    )

    assert len(engine) == 2
    assert engine.get_rule("cost-001") is cost_rule

    evaluations = engine.evaluate(
        {
            "cost": Decimal("0.20"),
            "latency_ms": 500,
        }
    )

    assert len(evaluations) == 2
    assert all(item.matched for item in evaluations)

    # 5. Recommendation generation.
    recommendations = engine.recommend(
        {
            "model": "model-a",
            "provider": "provider-a",
            "cost": Decimal("0.20"),
            "current_cost": Decimal("0.20"),
            "recommended_cost": Decimal("0.10"),
            "latency_ms": 500,
            "current_latency_ms": 500,
            "recommended_latency_ms": 250,
            "confidence": Decimal("0.9"),
        }
    )

    assert len(recommendations) == 2
    assert recommendations[0].priority >= recommendations[1].priority
    assert recommendations[0].model == "model-a"

    # 6. Rule management and history.
    assert len(engine.history()) == 2
    assert engine.remove_rule("latency-001") is True
    assert engine.remove_rule("missing") is False
    assert len(engine) == 1

    engine.clear_history()
    assert engine.history() == []

    engine.clear_rules()
    assert len(engine) == 0

    # 7. Factory and validation.
    factory_engine = create_recommendation_engine(
        rules=[cost_rule],
        max_history=10,
    )
    assert isinstance(factory_engine, RecommendationEngine)
    assert len(factory_engine) == 1

    try:
        RecommendationEngine(max_history=0)
    except ValueError:
        pass
    else:
        raise AssertionError("Invalid max_history was accepted")

    try:
        engine.register_rule("invalid")
    except TypeError:
        pass
    else:
        raise AssertionError("Invalid rule was accepted")

    print("RECOMMENDATION TESTS: PASS")
    print("TEST GROUPS: 7")
    print("RULES: PASS")
    print("RULE OPERATORS: PASS")
    print("SUGGESTIONS: PASS")
    print("ENGINE REGISTRATION: PASS")
    print("RECOMMENDATION GENERATION: PASS")
    print("HISTORY AND MANAGEMENT: PASS")
    print("FACTORY AND VALIDATION: PASS")


if __name__ == "__main__":
    run_tests()
