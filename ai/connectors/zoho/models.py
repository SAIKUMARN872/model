"""Typed request models for Zoho."""
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True, slots=True)
class ZohoOperationRequest:
    operation: str
    parameters: dict[str, Any]
