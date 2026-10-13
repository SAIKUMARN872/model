"""Policy-aware optimization for ModelNow."""

from dataclasses import dataclass, field
from typing import Any, Mapping, Sequence

from .rules import PolicyEvaluation, PolicyRule
from .validator import PolicyValidationResult, PolicyValidator


@dataclass(frozen=True)
class PolicyOptimizationResult:
    """Result produced by the policy optimizer."""

    allowed: bool
    action: str
    evaluations: tuple[PolicyEvaluation, ...] = ()
    applied_rules: tuple[str, ...] = ()
    reason: str = ""
    context: Mapping[str, Any] = field(default_factory=dict)
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        object.__setattr__(self, "evaluations", tuple(self.evaluations))
        object.__setattr__(self, "applied_rules", tuple(self.applied_rules))
        object.__setattr__(self, "context", dict(self.context))
        object.__setattr__(self, "metadata", dict(self.metadata))

    def as_dict(self) -> dict[str, Any]:
        """Return a serializable representation."""
        return {
            "allowed": self.allowed,
            "action": self.action,
            "evaluations": [item.as_dict() for item in self.evaluations],
            "applied_rules": list(self.applied_rules),
            "reason": self.reason,
            "context": dict(self.context),
            "metadata": dict(self.metadata),
        }


class PolicyOptimizer:
    """Apply policy constraints to optimization decisions."""

    def __init__(
        self,
        rules: Sequence[PolicyRule] | None = None,
        *,
        default_action: str = "allow",
    ) -> None:
        self._validator = PolicyValidator(
            rules=rules,
            default_action=default_action,
        )

    @property
    def validator(self) -> PolicyValidator:
        """Return the underlying policy validator."""
        return self._validator

    @property
    def rules(self) -> tuple[PolicyRule, ...]:
        """Return configured policy rules."""
        return self._validator.rules

    def add_rule(self, rule: PolicyRule) -> None:
        """Add or replace a policy rule."""
        self._validator.add_rule(rule)

    def remove_rule(self, rule_id: str) -> bool:
        """Remove a policy rule."""
        return self._validator.remove_rule(rule_id)

    def evaluate(
        self,
        context: Mapping[str, Any],
    ) -> PolicyValidationResult:
        """Validate an optimization context."""
        return self._validator.validate(context)

    def optimize(
        self,
        context: Mapping[str, Any],
    ) -> PolicyOptimizationResult:
        """Evaluate policy and return the resulting optimization decision."""
        validation = self.evaluate(context)

        matched = tuple(
            evaluation.rule_id
            for evaluation in validation.evaluations
            if evaluation.matched
        )

        action = "allow" if validation.allowed else "deny"

        if matched:
            matched_evaluations = [
                evaluation
                for evaluation in validation.evaluations
                if evaluation.matched
            ]
            action = (
                matched_evaluations[0].action
                if matched_evaluations
                else action
            )

        return PolicyOptimizationResult(
            allowed=validation.allowed,
            action=action,
            evaluations=validation.evaluations,
            applied_rules=matched,
            reason=validation.reason,
            context=context,
        )

    def is_allowed(self, context: Mapping[str, Any]) -> bool:
        """Return whether optimization is permitted."""
        return self._validator.is_allowed(context)

    def clear(self) -> None:
        """Remove all configured policy rules."""
        self._validator.clear()

    def __len__(self) -> int:
        return len(self._validator)


def create_policy_optimizer(
    rules: Sequence[PolicyRule] | None = None,
    *,
    default_action: str = "allow",
) -> PolicyOptimizer:
    """Create a policy optimizer."""
    return PolicyOptimizer(
        rules=rules,
        default_action=default_action,
    )


__all__ = [
    "PolicyOptimizationResult",
    "PolicyOptimizer",
    "create_policy_optimizer",
]
