"""Recommendation rules for ModelNow optimization."""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum
from typing import Any, Mapping

__all__ = [
    "RuleOperator",
    "RecommendationRule",
    "RuleEvaluation",
]


class RuleOperator(str, Enum):
    """Supported comparison operators."""

    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    GREATER_THAN = "greater_than"
    GREATER_OR_EQUAL = "greater_or_equal"
    LESS_THAN = "less_than"
    LESS_OR_EQUAL = "less_or_equal"
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"
    IN = "in"
    NOT_IN = "not_in"
    EXISTS = "exists"


@dataclass(frozen=True)
class RecommendationRule:
    """A single condition used to generate an optimization recommendation."""

    rule_id: str
    name: str
    field: str
    operator: RuleOperator
    value: Any = None
    recommendation_type: str = "optimization"
    priority: int = 0
    enabled: bool = True
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not str(self.rule_id).strip():
            raise ValueError("rule_id must not be empty")
        if not str(self.name).strip():
            raise ValueError("name must not be empty")
        if not str(self.field).strip():
            raise ValueError("field must not be empty")
        if self.priority < 0:
            raise ValueError("priority must be non-negative")

        object.__setattr__(self, "metadata", dict(self.metadata))

    def evaluate(self, context: Mapping[str, Any]) -> bool:
        """Evaluate this rule against a context mapping."""
        if not self.enabled:
            return False

        exists = self.field in context
        actual = context.get(self.field)

        if self.operator == RuleOperator.EXISTS:
            expected = bool(self.value) if self.value is not None else True
            return exists is expected

        if not exists:
            return False

        expected = self.value

        if self.operator == RuleOperator.EQUALS:
            return actual == expected

        if self.operator == RuleOperator.NOT_EQUALS:
            return actual != expected

        if self.operator == RuleOperator.GREATER_THAN:
            return _compare(actual, expected, lambda a, b: a > b)

        if self.operator == RuleOperator.GREATER_OR_EQUAL:
            return _compare(actual, expected, lambda a, b: a >= b)

        if self.operator == RuleOperator.LESS_THAN:
            return _compare(actual, expected, lambda a, b: a < b)

        if self.operator == RuleOperator.LESS_OR_EQUAL:
            return _compare(actual, expected, lambda a, b: a <= b)

        if self.operator == RuleOperator.CONTAINS:
            try:
                return expected in actual
            except TypeError:
                return False

        if self.operator == RuleOperator.NOT_CONTAINS:
            try:
                return expected not in actual
            except TypeError:
                return True

        if self.operator == RuleOperator.IN:
            try:
                return actual in expected
            except TypeError:
                return False

        if self.operator == RuleOperator.NOT_IN:
            try:
                return actual not in expected
            except TypeError:
                return True

        raise ValueError(f"Unsupported rule operator: {self.operator}")

    def as_dict(self) -> dict[str, Any]:
        """Serialize the rule."""
        return {
            "rule_id": self.rule_id,
            "name": self.name,
            "field": self.field,
            "operator": self.operator.value,
            "value": self.value,
            "recommendation_type": self.recommendation_type,
            "priority": self.priority,
            "enabled": self.enabled,
            "metadata": dict(self.metadata),
        }


@dataclass(frozen=True)
class RuleEvaluation:
    """Result of evaluating a recommendation rule."""

    rule_id: str
    matched: bool
    recommendation_type: str
    priority: int
    reason: str
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not str(self.rule_id).strip():
            raise ValueError("rule_id must not be empty")
        object.__setattr__(self, "metadata", dict(self.metadata))

    def as_dict(self) -> dict[str, Any]:
        """Serialize the evaluation result."""
        return {
            "rule_id": self.rule_id,
            "matched": self.matched,
            "recommendation_type": self.recommendation_type,
            "priority": self.priority,
            "reason": self.reason,
            "metadata": dict(self.metadata),
        }


def _compare(
    actual: Any,
    expected: Any,
    operation: Any,
) -> bool:
    """Perform a safe numeric/comparable-value comparison."""
    try:
        if isinstance(actual, (int, float, Decimal)) and isinstance(
            expected, (int, float, Decimal)
        ):
            return operation(Decimal(str(actual)), Decimal(str(expected)))
        return operation(actual, expected)
    except (TypeError, ValueError, ArithmeticError):
        return False
