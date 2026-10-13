"""Typed operation definitions for HubSpot."""

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True, slots=True)
class HubSpotOperation:
    name: str
    method: str
    path_template: str
    description: str
    schema: dict[str, Any]
