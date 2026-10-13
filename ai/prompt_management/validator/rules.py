from __future__ import annotations

from dataclasses import dataclass
from typing import Callable


@dataclass(frozen=True)
class ValidationRule:
    name: str
    description: str
    check: Callable[[str], str | None]
    enabled: bool = True
    severity: str = "error"

    def __post_init__(self) -> None:
        if not isinstance(self.name, str) or not self.name.strip():
            raise ValueError("rule name must be a non-empty string")
        if not isinstance(self.description, str):
            raise TypeError("rule description must be a string")
        if not callable(self.check):
            raise TypeError("rule check must be callable")
        if self.severity not in {"error", "warning", "info"}:
            raise ValueError("severity must be error, warning, or info")
