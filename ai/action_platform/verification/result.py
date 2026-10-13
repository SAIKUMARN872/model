"""Structured results for action verification."""

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class VerificationResult:
    """Outcome of verifying an executed action."""

    verified: bool
    action_id: str
    status: str
    checks: dict[str, bool] = field(default_factory=dict)
    message: str = ""
    evidence: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not isinstance(self.verified, bool):
            raise TypeError("verified must be a bool")
        if not isinstance(self.action_id, str) or not self.action_id.strip():
            raise ValueError("action_id must be a non-empty string")
        if not isinstance(self.status, str) or not self.status.strip():
            raise ValueError("status must be a non-empty string")
        if not isinstance(self.checks, dict):
            raise TypeError("checks must be a dictionary")
        if not all(
            isinstance(name, str) and name.strip()
            and isinstance(passed, bool)
            for name, passed in self.checks.items()
        ):
            raise ValueError("checks must map non-empty names to boolean results")
        if not isinstance(self.message, str):
            raise TypeError("message must be a string")
        if not isinstance(self.evidence, dict):
            raise TypeError("evidence must be a dictionary")
        if self.verified and not all(self.checks.values()):
            raise ValueError("A verified result cannot contain failed checks")

    def to_dict(self) -> dict[str, Any]:
        return {
            "verified": self.verified,
            "action_id": self.action_id,
            "status": self.status,
            "checks": dict(self.checks),
            "message": self.message,
            "evidence": dict(self.evidence),
        }
