from dataclasses import dataclass, field
from typing import Any

from .status import VerificationStatus


@dataclass
class VerificationResult:
    status: VerificationStatus
    check_name: str
    message: str
    evidence: list[dict[str, Any]] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not isinstance(self.status, VerificationStatus):
            raise ValueError("status must be a VerificationStatus.")
        if not isinstance(self.check_name, str) or not self.check_name.strip():
            raise ValueError("check_name must be a non-empty string.")
        if not isinstance(self.message, str) or not self.message.strip():
            raise ValueError("message must be a non-empty string.")
        if not isinstance(self.evidence, list):
            raise ValueError("evidence must be a list.")
        if any(not isinstance(item, dict) for item in self.evidence):
            raise ValueError("Each evidence item must be a dictionary.")

    @property
    def passed(self) -> bool:
        return self.status is VerificationStatus.PASSED

    def to_dict(self) -> dict[str, Any]:
        return {
            "status": self.status.value,
            "check_name": self.check_name,
            "message": self.message,
            "evidence": [dict(item) for item in self.evidence],
        }
