"""Typed GitHub API operation metadata."""

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class GitHubOperation:
    name: str
    path_template: str
    description: str
    schema: dict
