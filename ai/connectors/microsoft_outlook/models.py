"""Microsoft Outlook operation definitions."""

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True, slots=True)
class OutlookOperation:
    name: str
    method: str
    path: str
    description: str
    schema: dict[str, Any]
    permission: str
