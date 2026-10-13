"""Google Drive connector operation definitions."""
from dataclasses import dataclass
from typing import Any, Mapping

@dataclass(frozen=True)
class GoogleDriveOperation:
    name: str
    path: str
    description: str
    schema: Mapping[str, Any]
