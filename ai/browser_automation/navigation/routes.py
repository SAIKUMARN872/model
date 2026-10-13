"""Route data models and route validation."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable

from .utils import validate_url


@dataclass(frozen=True)
class NavigationRoute:
    name: str
    url: str
    description: str = ""
    requires_approval: bool = False
    metadata: dict[str, str] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not isinstance(self.name, str) or not self.name.strip():
            raise ValueError("Route name must be non-empty.")
        object.__setattr__(self, "url", validate_url(self.url))


def validate_routes(routes: Iterable[NavigationRoute]) -> list[NavigationRoute]:
    """Validate and deduplicate routes by normalized URL."""
    result = []
    seen = set()

    for route in routes:
        if not isinstance(route, NavigationRoute):
            raise TypeError("Every route must be a NavigationRoute.")
        key = route.url.casefold()
        if key not in seen:
            seen.add(key)
            result.append(route)

    return result
