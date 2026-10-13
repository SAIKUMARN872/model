from __future__ import annotations

import re
from collections.abc import Iterable

from .rules import ValidationRule
from .safety import default_safety_rules


def validate_prompt_text(prompt: str) -> str:
    if not isinstance(prompt, str):
        raise TypeError("prompt must be a string")
    if not prompt.strip():
        raise ValueError("prompt must not be empty")
    return prompt


def normalize_rule_name(name: str) -> str:
    if not isinstance(name, str):
        raise TypeError("rule name must be a string")
    normalized = re.sub(r"[^a-z0-9_]+", "_", name.strip().lower()).strip("_")
    if not normalized:
        raise ValueError("rule name must contain letters or numbers")
    return normalized


def default_validation_rules() -> tuple[ValidationRule, ...]:
    def check_max_length(prompt: str) -> str | None:
        return "Prompt exceeds the default 20,000-character limit." if len(prompt) > 20_000 else None

    def check_control_characters(prompt: str) -> str | None:
        if any(ord(char) < 32 and char not in "\n\r\t" for char in prompt):
            return "Prompt contains unsupported control characters."
        return None

    def check_unresolved_placeholders(prompt: str) -> str | None:
        if re.search(r"\{\{?\s*[A-Za-z_][A-Za-z0-9_]*\s*\}?\}", prompt):
            return "Prompt may contain an unresolved template placeholder."
        return None

    return (
        ValidationRule(
            "max_length",
            "Limits prompt size.",
            check_max_length,
            severity="error",
        ),
        ValidationRule(
            "control_characters",
            "Rejects unsupported control characters.",
            check_control_characters,
            severity="error",
        ),
        ValidationRule(
            "unresolved_placeholders",
            "Warns about possible unrendered variables.",
            check_unresolved_placeholders,
            severity="warning",
        ),
        *default_safety_rules(),
    )


def validate_rules(rules: Iterable[ValidationRule]) -> tuple[ValidationRule, ...]:
    if isinstance(rules, (str, bytes)):
        raise TypeError("rules must be an iterable of ValidationRule objects")
    result = tuple(rules)
    if any(not isinstance(rule, ValidationRule) for rule in result):
        raise TypeError("every rule must be a ValidationRule")
    names = [normalize_rule_name(rule.name) for rule in result]
    if len(names) != len(set(names)):
        raise ValueError("rule names must be unique")
    return result
