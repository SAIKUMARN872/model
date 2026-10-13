"""Gmail operation metadata."""

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class GmailOperation:
    name: str
    path_template: str
    description: str
    schema: dict
