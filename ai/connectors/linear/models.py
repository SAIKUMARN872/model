"""Linear operation definitions."""

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True, slots=True)
class LinearOperation:
    name: str
    query: str
    description: str
    schema: dict[str, Any]
