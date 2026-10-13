"""PostgreSQL operation definitions."""
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True, slots=True)
class PostgreSQLOperation:
    name: str
    description: str
    schema: dict[str, Any]
