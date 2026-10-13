"""Permission-aware tool selection for ModelNow."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..permissions.policy import (
    PermissionContext,
    ToolPermissionError,
    authorize_tool,
)
from ..registry.models import ToolSpec
from ..registry.registry import ToolRegistry
from .ranking import rank_candidates
from .scoring import ToolScorer


@dataclass(frozen=True)
class ToolSelectionRequest:
    """Inputs and constraints for selecting a tool."""

    request_text: str
    required_tags: tuple[str, ...] = ()
    permission_context: PermissionContext | None = None
    top_k: int = 5

    def __post_init__(self) -> None:
        if not isinstance(self.request_text, str) or not self.request_text.strip():
            raise ValueError("request_text must be a non-empty string.")
        if not isinstance(self.required_tags, tuple) or any(
            not isinstance(tag, str) or not tag.strip()
            for tag in self.required_tags
        ):
            raise ValueError("required_tags must be a tuple of non-empty strings.")
        if self.permission_context is not None and not isinstance(
            self.permission_context, PermissionContext
        ):
            raise TypeError("permission_context must be a PermissionContext or None.")
        if isinstance(self.top_k, bool) or not isinstance(self.top_k, int):
            raise TypeError("top_k must be an integer.")
        if self.top_k < 1:
            raise ValueError("top_k must be at least 1.")


@dataclass(frozen=True)
class ToolSelectionCandidate:
    """A tool with its relevance score."""

    tool: ToolSpec
    score: float


@dataclass(frozen=True)
class ToolSelectionResult:
    """Selection outcome, ranked alternatives, and explanation."""

    selected_tool: ToolSpec | None
    candidates: tuple[ToolSelectionCandidate, ...]
    reason: str

    @property
    def success(self) -> bool:
        return self.selected_tool is not None

    def to_dict(self) -> dict[str, Any]:
        return {
            "success": self.success,
            "selected_tool": (
                {
                    "name": self.selected_tool.name,
                    "version": self.selected_tool.version,
                }
                if self.selected_tool is not None
                else None
            ),
            "candidates": [
                {
                    "name": candidate.tool.name,
                    "version": candidate.tool.version,
                    "score": candidate.score,
                }
                for candidate in self.candidates
            ],
            "reason": self.reason,
        }


class ToolSelector:
    """Filters eligible tools and chooses the strongest lexical match."""

    def __init__(
        self,
        registry: ToolRegistry,
        scorer: ToolScorer | None = None,
    ) -> None:
        if not isinstance(registry, ToolRegistry):
            raise TypeError("registry must be a ToolRegistry.")
        self.registry = registry
        self.scorer = scorer if scorer is not None else ToolScorer()

    def select(self, request: ToolSelectionRequest) -> ToolSelectionResult:
        if not isinstance(request, ToolSelectionRequest):
            raise TypeError("request must be a ToolSelectionRequest.")

        required_tags = {tag.casefold() for tag in request.required_tags}
        scored: list[tuple[ToolSpec, float]] = []

        for tool in self.registry.list_tools(enabled_only=True):
            tool_tags = {tag.casefold() for tag in tool.tags}
            if not required_tags.issubset(tool_tags):
                continue

            try:
                authorize_tool(
                    tool.required_permissions,
                    request.permission_context,
                )
            except ToolPermissionError:
                continue

            score = self.scorer.score(tool, request.request_text)
            if score > 0:
                scored.append((tool, score))

        ranked = rank_candidates(scored)[:request.top_k]
        candidates = tuple(
            ToolSelectionCandidate(tool=tool, score=score)
            for tool, score in ranked
        )

        if not candidates:
            return ToolSelectionResult(
                selected_tool=None,
                candidates=(),
                reason=(
                    "No enabled tool matched the request and satisfied "
                    "the supplied tag and permission constraints."
                ),
            )

        return ToolSelectionResult(
            selected_tool=candidates[0].tool,
            candidates=candidates,
            reason="Selected the highest-scoring eligible tool.",
        )
