"""Simple deterministic navigation route planner."""

from __future__ import annotations

from dataclasses import dataclass

from .routes import NavigationRoute, validate_routes


@dataclass(frozen=True)
class NavigationPlan:
    goal: str
    routes: tuple[NavigationRoute, ...]
    rationale: str


class NavigationPlanner:
    """Build a validated plan from routes supplied by a trusted caller."""

    def plan(
        self,
        goal: str,
        routes: list[NavigationRoute],
        *,
        max_routes: int = 10,
    ) -> NavigationPlan:
        if not isinstance(goal, str) or not goal.strip():
            raise ValueError("Navigation goal must be non-empty.")
        if isinstance(max_routes, bool) or not isinstance(max_routes, int) or max_routes < 1:
            raise ValueError("max_routes must be a positive integer.")

        validated = validate_routes(routes)
        selected = tuple(validated[:max_routes])
        return NavigationPlan(
            goal=goal.strip()[:1000],
            routes=selected,
            rationale=f"Selected {len(selected)} validated route(s) in supplied order.",
        )
