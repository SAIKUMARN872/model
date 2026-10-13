"""Goal models for browser task planning."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class BrowserGoal:
    description: str
    start_url: str | None = None
    success_criteria: tuple[str, ...] = ()
    constraints: tuple[str, ...] = ()
    metadata: dict[str, str] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not isinstance(self.description, str) or not self.description.strip():
            raise ValueError("Goal description must be non-empty.")
        if len(self.description) > 2000:
            raise ValueError("Goal description is too long.")
        if self.start_url is not None:
            from ai.browser_automation.navigation.utils import validate_url
            object.__setattr__(self, "start_url", validate_url(self.start_url))
        if len(self.success_criteria) > 50 or len(self.constraints) > 50:
            raise ValueError("Too many goal criteria or constraints.")
