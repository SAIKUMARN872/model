"""Typed GitLab API operation metadata."""

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class GitLabOperation:
    name: str
    path_template: str
    description: str
    schema: dict
