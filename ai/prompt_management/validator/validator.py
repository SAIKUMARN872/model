from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .rules import ValidationRule
from .utils import (
    default_validation_rules,
    validate_prompt_text,
    validate_rules,
)


@dataclass(frozen=True)
class ValidationIssue:
    rule: str
    severity: str
    message: str


@dataclass(frozen=True)
class ValidationResult:
    valid: bool
    issues: tuple[ValidationIssue, ...]
    checked_rules: tuple[str, ...]

    @property
    def errors(self) -> tuple[ValidationIssue, ...]:
        return tuple(issue for issue in self.issues if issue.severity == "error")

    @property
    def warnings(self) -> tuple[ValidationIssue, ...]:
        return tuple(issue for issue in self.issues if issue.severity == "warning")

    def to_dict(self) -> dict[str, Any]:
        return {
            "valid": self.valid,
            "checked_rules": list(self.checked_rules),
            "issues": [
                {
                    "rule": issue.rule,
                    "severity": issue.severity,
                    "message": issue.message,
                }
                for issue in self.issues
            ],
        }


class PromptValidator:
    """Configurable prompt checks with structured errors and warnings."""

    def __init__(
        self,
        rules: tuple[ValidationRule, ...] | list[ValidationRule] | None = None,
    ) -> None:
        self._rules = validate_rules(
            default_validation_rules() if rules is None else rules
        )

    @property
    def rules(self) -> tuple[ValidationRule, ...]:
        return self._rules

    def validate(self, prompt: str) -> ValidationResult:
        validate_prompt_text(prompt)
        issues: list[ValidationIssue] = []
        checked: list[str] = []

        for rule in self._rules:
            if not rule.enabled:
                continue
            checked.append(rule.name)
            try:
                message = rule.check(prompt)
            except Exception as exc:
                issues.append(ValidationIssue(
                    rule=rule.name,
                    severity="error",
                    message=f"Validation rule failed internally: {type(exc).__name__}",
                ))
                continue

            if message is not None:
                if not isinstance(message, str) or not message.strip():
                    issues.append(ValidationIssue(
                        rule=rule.name,
                        severity="error",
                        message="Validation rule returned an invalid message.",
                    ))
                else:
                    issues.append(ValidationIssue(
                        rule=rule.name,
                        severity=rule.severity,
                        message=message,
                    ))

        valid = not any(issue.severity == "error" for issue in issues)
        return ValidationResult(
            valid=valid,
            issues=tuple(issues),
            checked_rules=tuple(checked),
        )

    def validate_or_raise(self, prompt: str) -> ValidationResult:
        result = self.validate(prompt)
        if not result.valid:
            details = "; ".join(issue.message for issue in result.errors)
            raise ValueError(f"Prompt validation failed: {details}")
        return result


def validate_prompt(prompt: str) -> ValidationResult:
    return PromptValidator().validate(prompt)
