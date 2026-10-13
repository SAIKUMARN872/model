"""Microsoft Teams operation definitions."""

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True, slots=True)
class TeamsOperation:
    name: str
    method: str
    path: str
    description: str
    schema: dict[str, Any]
