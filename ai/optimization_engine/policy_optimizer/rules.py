"""Policy rule definitions for ModelNow optimization."""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Mapping


class PolicyOperator(str, Enum):
    """Supported policy comparison operators."""

    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    GREATER_THAN = "greater_than"
    GREATER_OR_EQUAL = "greater_or_equal"
    LESS_THAN = "less_than"
    LESS_OR_EQUAL = "less_or_equal"
    IN = "in"
    NOT_IN = "not_in"
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"
    EXISTS = "exists"


@dataclass(frozen=True)
class PolicyRule:
    """A single policy rule evaluated against optimization context."""

    rule_id: str
    name: str
    field: str
    operator: PolicyOperator
    value: Any = None
    action: str = "allow"
    priority: int = 0
    enabled: bool = True
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not isinstance(self.rule_id, str) or not self.rule_id.strip():
            raise ValueError("rule_id must be a non-empty string")

        if not isinstance(self.name, str) or not self.name.strip():
            raise ValueError("name must be a non-empty string")

        if not isinstance(self.field, str) or not self.field.strip():
            raise ValueError("field must be a non-empty string")

        if not isinstance(self.action, str) or not self.action.strip():
            raise ValueError("action must be a non-empty string")

        if not isinstance(self.priority, int) or self.priority < 0:
            raise ValueError("priority must be a non-negative integer")

        if not isinstance(self.operator, PolicyOperator):
            try:
                object.__setattr__(
                    self,
                    "operator",
                    PolicyOperator(self.operator),
                )
            except (TypeError, ValueError) as exc:
                raise ValueError("operator must be a valid PolicyOperator") from exc

        object.__setattr__(self, "metadata", dict(self.metadata))

    def evaluate(self, context: Mapping[str, Any]) -> bool:
        """Evaluate this rule against a context mapping."""
        if not self.enabled:
            return False

        exists = self.field in context
        actual = context.get(self.field)

        if self.operator is PolicyOperator.EXISTS:
            return exists

        if not exists:
            return False

        if self.operator is PolicyOperator.EQUALS:
            return actual == self.value

        if self.operator is PolicyOperator.NOT_EQUALS:
            return actual != self.value

        if self.operator is PolicyOperator.IN:
            try:
                return actual in self.value
            except (TypeError, ValueError):
                return False

        if self.operator is PolicyOperator.NOT_IN:
            try:
                return actual not in self.value
            except (TypeError, ValueError):
                return False

        if self.operator is PolicyOperator.CONTAINS:
            try:
                return self.value in actual
            except (TypeError, ValueError):
                return False

        if self.operator is PolicyOperator.NOT_CONTAINS:
            try:
                return self.value not in actual
            except (TypeError, ValueError):
                return False

        try:
            if self.operator is PolicyOperator.GREATER_THAN:
                return actual > self.value

            if self.operator is PolicyOperator.GREATER_OR_EQUAL:
                return actual >= self.value

            if self.operator is PolicyOperator.LESS_THAN:
                return actual < self.value

            if self.operator is PolicyOperator.LESS_OR_EQUAL:
                return actual <= self.value
        except TypeError:
            return False

        return False

    def as_dict(self) -> dict[str, Any]:
        """Return a serializable representation."""
        return {
            "rule_id": self.rule_id,
            "name": self.name,
            "field": self.field,
            "operator": self.operator.value,
            "value": self.value,
            "action": self.action,
            "priority": self.priority,
            "enabled": self.enabled,
            "metadata": dict(self.metadata),
        }


@dataclass(frozen=True)
class PolicyEvaluation:
    """Result of evaluating a policy rule."""

    rule_id: str
    matched: bool
    action: str
    priority: int
    reason: str
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not isinstance(self.rule_id, str) or not self.rule_id.strip():
            raise ValueError("rule_id must be a non-empty string")

        if not isinstance(self.action, str) or not self.action.strip():
            raise ValueError("action must be a non-empty string")

        if not isinstance(self.priority, int) or self.priority < 0:
            raise ValueError("priority must be a non-negative integer")

        object.__setattr__(self, "metadata", dict(self.metadata))

    def as_dict(self) -> dict[str, Any]:
        """Return a serializable representation."""
        return {
            "rule_id": self.rule_id,
            "matched": self.matched,
            "action": self.action,
            "priority": self.priority,
            "reason": self.reason,
            "metadata": dict(self.metadata),
        }


__all__ = [
    "PolicyEvaluation",
    "PolicyOperator",
    "PolicyRule",
]
