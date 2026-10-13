"""Regression tests for the ModelNow policy optimizer."""

from .optimizer import (
    PolicyOptimizationResult,
    PolicyOptimizer,
    create_policy_optimizer,
)
from .rules import (
    PolicyEvaluation,
    PolicyOperator,
    PolicyRule,
)
from .utils import (
    context_value,
    freeze_context,
    make_policy_id,
    normalize_action,
    normalize_field,
    to_decimal,
)
from .validator import (
    PolicyValidationResult,
    PolicyValidator,
    create_policy_validator,
)


def test_rules() -> None:
    rule = PolicyRule(
        rule_id="cost-limit",
        name="Cost Limit",
        field="cost",
        operator=PolicyOperator.GREATER_THAN,
        value=1.0,
        action="deny",
        priority=10,
    )

    assert rule.evaluate({"cost": 2.0}) is True
    assert rule.evaluate({"cost": 0.5}) is False
    assert rule.evaluate({"other": 2.0}) is False
    assert rule.as_dict()["action"] == "deny"

    evaluation = PolicyEvaluation(
        rule_id="cost-limit",
        matched=True,
        action="deny",
        priority=10,
        reason="matched",
    )

    assert evaluation.as_dict()["matched"] is True


def test_operators() -> None:
    context = {
        "model": "gpt",
        "cost": 5,
        "tags": ["premium", "production"],
    }

    assert PolicyRule(
        "r1", "equals", "model", PolicyOperator.EQUALS, "gpt"
    ).evaluate(context)

    assert PolicyRule(
        "r2", "not equals", "model", PolicyOperator.NOT_EQUALS, "other"
    ).evaluate(context)

    assert PolicyRule(
        "r3", "greater", "cost", PolicyOperator.GREATER_THAN, 4
    ).evaluate(context)

    assert PolicyRule(
        "r4", "greater eq", "cost",
        PolicyOperator.GREATER_OR_EQUAL, 5
    ).evaluate(context)

    assert PolicyRule(
        "r5", "less", "cost", PolicyOperator.LESS_THAN, 6
    ).evaluate(context)

    assert PolicyRule(
        "r6", "less eq", "cost",
        PolicyOperator.LESS_OR_EQUAL, 5
    ).evaluate(context)

    assert PolicyRule(
        "r7", "in", "model", PolicyOperator.IN, {"gpt", "claude"}
    ).evaluate(context)

    assert PolicyRule(
        "r8", "not in", "model",
        PolicyOperator.NOT_IN, {"other"}
    ).evaluate(context)

    assert PolicyRule(
        "r9", "contains", "tags",
        PolicyOperator.CONTAINS, "premium"
    ).evaluate(context)

    assert PolicyRule(
        "r10", "not contains", "tags",
        PolicyOperator.NOT_CONTAINS, "free"
    ).evaluate(context)

    assert PolicyRule(
        "r11", "exists", "model", PolicyOperator.EXISTS
    ).evaluate(context)


def test_validator() -> None:
    rules = [
        PolicyRule(
            "allow-prod",
            "Allow Production",
            "environment",
            PolicyOperator.EQUALS,
            "production",
            action="allow",
            priority=1,
        ),
        PolicyRule(
            "block-expensive",
            "Block Expensive Requests",
            "cost",
            PolicyOperator.GREATER_THAN,
            10,
            action="deny",
            priority=20,
        ),
    ]

    validator = PolicyValidator(rules)

    allowed = validator.validate(
        {"environment": "production", "cost": 5}
    )
    assert isinstance(allowed, PolicyValidationResult)
    assert allowed.allowed is True
    assert "allow-prod" in allowed.matched_rules

    blocked = validator.validate(
        {"environment": "production", "cost": 20}
    )
    assert blocked.allowed is False
    assert "block-expensive" in blocked.blocked_rules
    assert validator.is_allowed({"cost": 1}) is True


def test_optimizer() -> None:
    rule = PolicyRule(
        "block-high-cost",
        "Block High Cost",
        "cost",
        PolicyOperator.GREATER_THAN,
        10,
        action="deny",
        priority=100,
    )

    optimizer = PolicyOptimizer([rule])

    result = optimizer.optimize({"cost": 20})

    assert isinstance(result, PolicyOptimizationResult)
    assert result.allowed is False
    assert result.action == "deny"
    assert "block-high-cost" in result.applied_rules

    assert optimizer.is_allowed({"cost": 2}) is True

    optimizer.add_rule(
        PolicyRule(
            "block-prod",
            "Block Production",
            "environment",
            PolicyOperator.EQUALS,
            "restricted",
            action="deny",
        )
    )

    assert len(optimizer) == 2
    assert optimizer.remove_rule("block-prod") is True
    assert optimizer.remove_rule("missing") is False


def test_utils() -> None:
    assert normalize_action("  DENY ") == "deny"
    assert normalize_field("  cost ") == "cost"
    assert to_decimal(1.5) == to_decimal("1.5")

    context = {"cost": 5}
    assert context_value(context, "cost") == 5
    assert context_value(context, "missing", 10) == 10
    assert freeze_context(context) == context

    policy_id_1 = make_policy_id("Cost Limit", "cost", "deny")
    policy_id_2 = make_policy_id("Cost Limit", "cost", "deny")
    assert policy_id_1 == policy_id_2
    assert len(policy_id_1) == 16


def test_factories_and_validation() -> None:
    validator = create_policy_validator()
    optimizer = create_policy_optimizer()

    assert isinstance(validator, PolicyValidator)
    assert isinstance(optimizer, PolicyOptimizer)

    try:
        PolicyRule(
            "",
            "Invalid",
            "cost",
            PolicyOperator.EQUALS,
        )
        raise AssertionError("Expected ValueError")
    except ValueError:
        pass

    try:
        PolicyValidator(default_action="")
        raise AssertionError("Expected ValueError")
    except ValueError:
        pass


def main() -> None:
    test_rules()
    print("RULES: PASS")

    test_operators()
    print("OPERATORS: PASS")

    test_validator()
    print("VALIDATOR: PASS")

    test_optimizer()
    print("OPTIMIZER: PASS")

    test_utils()
    print("UTILS: PASS")

    test_factories_and_validation()
    print("FACTORY AND VALIDATION: PASS")

    print("POLICY OPTIMIZER TESTS: PASS")
    print("TEST GROUPS: 6")


if __name__ == "__main__":
    main()
