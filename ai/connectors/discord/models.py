"""Typed Discord connector operations."""

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class DiscordOperation:
    name: str
    method: str
    path_template: str
    description: str
    schema: dict
