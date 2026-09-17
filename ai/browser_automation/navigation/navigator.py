"""
Navigation planning.

Converts a target URL and navigation requirements into
an ordered set of navigation actions.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from .utils import (
    validate_url,
)


class NavigationAction(
    str,
    Enum,
):
    GOTO = "goto"
    BACK = "back"
    FORWARD = "forward"
    RELOAD = "reload"
    WAIT = "wait"


@dataclass
class NavigationStep:
    """One navigation operation."""

    action: NavigationAction

    url: str | None = None

    wait_until: str = "domcontentloaded"

    timeout: int | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


@dataclass
class NavigationPlan:
    """Ordered browser navigation plan."""

    target_url: str

    steps: list[
        NavigationStep
    ] = field(
        default_factory=list
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def add(
        self,
        step: NavigationStep,
    ) -> None:

        self.steps.append(
            step
        )


class NavigationPlanner:
    """Creates navigation plans."""

    def create(
        self,
        target_url: str,
        *,
        wait_until: str = "domcontentloaded",
        timeout: int | None = None,
    ) -> NavigationPlan:

        target_url = validate_url(
            target_url
        )

        plan = NavigationPlan(
            target_url=target_url
        )

        plan.add(
            NavigationStep(
                action=NavigationAction.GOTO,
                url=target_url,
                wait_until=wait_until,
                timeout=timeout,
            )
        )

        return plan

    def create_sequence(
        self,
        urls: list[str],
    ) -> NavigationPlan:

        if not urls:

            raise ValueError(
                "At least one URL is required."
            )

        normalized = [
            validate_url(url)
            for url in urls
        ]

        plan = NavigationPlan(
            target_url=normalized[-1]
        )

        for url in normalized:

            plan.add(
                NavigationStep(
                    action=NavigationAction.GOTO,
                    url=url,
                )
            )

        return plan

    def back(
        self,
        plan: NavigationPlan,
    ) -> NavigationPlan:

        plan.add(
            NavigationStep(
                action=NavigationAction.BACK
            )
        )

        return plan

    def forward(
        self,
        plan: NavigationPlan,
    ) -> NavigationPlan:

        plan.add(
            NavigationStep(
                action=NavigationAction.FORWARD
            )
        )

        return plan

    def reload(
        self,
        plan: NavigationPlan,
    ) -> NavigationPlan:

        plan.add(
            NavigationStep(
                action=NavigationAction.RELOAD
            )
        )

        return plan

    def wait(
        self,
        plan: NavigationPlan,
        milliseconds: int,
    ) -> NavigationPlan:

        if milliseconds < 0:

            raise ValueError(
                "milliseconds cannot be negative."
            )

        plan.add(
            NavigationStep(
                action=NavigationAction.WAIT,
                metadata={
                    "milliseconds": milliseconds
                },
            )
        )

        return plan