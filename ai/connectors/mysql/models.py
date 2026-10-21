"""MySQL operation definitions."""

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True, slots=True)
class MySQLOperation:
    name: str
    description: str
    schema: dict[str, Any]
