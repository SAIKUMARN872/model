"""Policy validation for ModelNow optimization."""

from dataclasses import dataclass, field
from typing import Any, Mapping, Sequence

from .rules import PolicyEvaluation, PolicyRule


@dataclass(frozen=True)
class PolicyValidationResult:
    """Result returned after validating a context against policy rules."""

    allowed: bool
    evaluations: tuple[PolicyEvaluation, ...] = ()
    matched_rules: tuple[str, ...] = ()
    blocked_rules: tuple[str, ...] = ()
    reason: str = ""
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        object.__setattr__(self, "evaluations", tuple(self.evaluations))
        object.__setattr__(self, "matched_rules", tuple(self.matched_rules))
        object.__setattr__(self, "blocked_rules", tuple(self.blocked_rules))
        object.__setattr__(self, "metadata", dict(self.metadata))

    def as_dict(self) -> dict[str, Any]:
        """Return a serializable representation."""
        return {
            "allowed": self.allowed,
            "evaluations": [item.as_dict() for item in self.evaluations],
            "matched_rules": list(self.matched_rules),
            "blocked_rules": list(self.blocked_rules),
            "reason": self.reason,
            "metadata": dict(self.metadata),
        }


class PolicyValidator:
    """Evaluate and enforce a collection of policy rules."""

    def __init__(
        self,
        rules: Sequence[PolicyRule] | None = None,
        *,
        default_action: str = "allow",
    ) -> None:
        if not isinstance(default_action, str) or not default_action.strip():
            raise ValueError("default_action must be a non-empty string")

        self._default_action = default_action.strip().lower()
        self._rules: list[PolicyRule] = list(rules or [])

    @property
    def rules(self) -> tuple[PolicyRule, ...]:
        """Return rules ordered by priority."""
        return tuple(
            sorted(
                self._rules,
                key=lambda rule: (-rule.priority, rule.rule_id),
            )
        )

    def add_rule(self, rule: PolicyRule) -> None:
        """Add or replace a rule by ID."""
        if not isinstance(rule, PolicyRule):
            raise TypeError("rule must be a PolicyRule")

        self._rules = [
            existing for existing in self._rules
            if existing.rule_id != rule.rule_id
        ]
        self._rules.append(rule)

    def remove_rule(self, rule_id: str) -> bool:
        """Remove a rule and return whether it existed."""
        before = len(self._rules)
        self._rules = [
            rule for rule in self._rules
            if rule.rule_id != rule_id
        ]
        return len(self._rules) != before

    def evaluate(self, context: Mapping[str, Any]) -> tuple[PolicyEvaluation, ...]:
        """Evaluate all enabled rules against a context."""
        evaluations: list[PolicyEvaluation] = []

        for rule in self.rules:
            matched = rule.evaluate(context)

            if matched:
                reason = (
                    f"Policy rule '{rule.name}' matched "
                    f"field '{rule.field}'."
                )
            else:
                reason = (
                    f"Policy rule '{rule.name}' did not match "
                    f"field '{rule.field}'."
                )

            evaluations.append(
                PolicyEvaluation(
                    rule_id=rule.rule_id,
                    matched=matched,
                    action=rule.action,
                    priority=rule.priority,
                    reason=reason,
                    metadata=rule.metadata,
                )
            )

        return tuple(evaluations)

    def validate(self, context: Mapping[str, Any]) -> PolicyValidationResult:
        """Validate a context and determine whether it is allowed."""
        evaluations = self.evaluate(context)
        matched = tuple(item.rule_id for item in evaluations if item.matched)

        blocking_actions = {"deny", "block", "reject", "forbid"}
        blocking = tuple(
            item.rule_id
            for item in evaluations
            if item.matched and item.action.lower() in blocking_actions
        )

        if blocking:
            reason = f"Request blocked by policy rule(s): {', '.join(blocking)}."
            allowed = False
        else:
            allowed = self._default_action not in blocking_actions
            reason = (
                "Request allowed by matching policy rules."
                if matched
                else "No policy rule matched; default policy applied."
            )

        return PolicyValidationResult(
            allowed=allowed,
            evaluations=evaluations,
            matched_rules=matched,
            blocked_rules=blocking,
            reason=reason,
        )

    def is_allowed(self, context: Mapping[str, Any]) -> bool:
        """Return whether a context passes policy validation."""
        return self.validate(context).allowed

    def clear(self) -> None:
        """Remove all configured rules."""
        self._rules.clear()

    def __len__(self) -> int:
        return len(self._rules)


def create_policy_validator(
    rules: Sequence[PolicyRule] | None = None,
    *,
    default_action: str = "allow",
) -> PolicyValidator:
    """Create a configured policy validator."""
    return PolicyValidator(
        rules=rules,
        default_action=default_action,
    )


__all__ = [
    "PolicyValidationResult",
    "PolicyValidator",
    "create_policy_validator",
]
