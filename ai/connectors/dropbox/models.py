"""Typed Dropbox API operations."""

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class DropboxOperation:
    name: str
    path: str
    description: str
    schema: dict
