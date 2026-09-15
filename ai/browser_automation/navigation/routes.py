"""
Route and navigation models.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from urllib.parse import urlparse


@dataclass
class Route:
    """Represents a browser navigation route."""

    url: str

    name: str | None = None

    method: str = "GET"

    priority: int = 0

    metadata: dict[str, str] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        self.url = self.url.strip()

        if not self.url:
            raise ValueError(
                "Route URL cannot be empty."
            )

        parsed = urlparse(
            self.url
        )

        if parsed.scheme not in (
            "http",
            "https",
        ):

            raise ValueError(
                "Route URL must use HTTP or HTTPS."
            )

        self.method = (
            self.method.upper()
        )


class RouteTable:
    """In-memory route registry."""

    def __init__(self) -> None:

        self._routes: dict[
            str,
            Route,
        ] = {}

    def add(
        self,
        route: Route,
        overwrite: bool = False,
    ) -> None:

        if (
            route.url in self._routes
            and not overwrite
        ):

            raise ValueError(
                f"Route already exists: "
                f"{route.url}"
            )

        self._routes[
            route.url
        ] = route

    def get(
        self,
        url: str,
    ) -> Route | None:

        return self._routes.get(
            url
        )

    def remove(
        self,
        url: str,
    ) -> Route | None:

        return self._routes.pop(
            url,
            None,
        )

    def all(
        self,
    ) -> list[Route]:

        return sorted(
            self._routes.values(),
            key=lambda route: (
                -route.priority,
                route.url,
            ),
        )

    def clear(self) -> None:

        self._routes.clear()

    def __len__(
        self,
    ) -> int:

        return len(
            self._routes
        )