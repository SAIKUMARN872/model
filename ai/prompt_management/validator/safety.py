from __future__ import annotations

import re

from .rules import ValidationRule


_SENSITIVE_PATTERNS = (
    ("possible_api_key", re.compile(
        r"(?i)\b(?:api[_-]?key|secret[_-]?key|access[_-]?token)"
        r"\s*[:=]\s*['\"]?[A-Za-z0-9_\-./+=]{12,}"
    )),
    ("possible_private_key", re.compile(
        r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"
    )),
    ("possible_password", re.compile(
        r"(?i)\bpassword\s*[:=]\s*['\"]?[^'\"\s]{6,}"
    )),
)

_INJECTION_PATTERNS = (
    re.compile(r"(?i)\bignore\s+(?:all\s+)?previous\s+instructions\b"),
    re.compile(r"(?i)\bdisregard\s+(?:all\s+)?(?:prior|previous)\s+instructions\b"),
    re.compile(r"(?i)\b(?:reveal|print|show)\s+(?:the\s+)?system prompt\b"),
)


def detect_sensitive_patterns(prompt: str) -> list[str]:
    """Return rule identifiers for possible secrets; does not verify credentials."""
    findings: list[str] = []
    for name, pattern in _SENSITIVE_PATTERNS:
        if pattern.search(prompt):
            findings.append(name)
    return findings


def detect_injection_patterns(prompt: str) -> list[str]:
    """Detect a small set of common instruction-override phrases."""
    return [
        f"instruction_override_{index + 1}"
        for index, pattern in enumerate(_INJECTION_PATTERNS)
        if pattern.search(prompt)
    ]


def default_safety_rules() -> tuple[ValidationRule, ...]:
    return (
        ValidationRule(
            name="possible_sensitive_data",
            description="Prompt may contain a credential or private key.",
            check=lambda prompt: (
                "Possible credential or private-key material detected."
                if detect_sensitive_patterns(prompt) else None
            ),
            severity="warning",
        ),
        ValidationRule(
            name="instruction_override",
            description="Prompt contains a common instruction-override phrase.",
            check=lambda prompt: (
                "Possible instruction-override phrase detected; review context."
                if detect_injection_patterns(prompt) else None
            ),
            severity="warning",
        ),
    )
