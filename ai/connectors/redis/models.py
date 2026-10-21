"""Redis operation model."""
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True, slots=True)
class RedisOperation:
    name: str
    description: str
    schema: dict[str, Any]
