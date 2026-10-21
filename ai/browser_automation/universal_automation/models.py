"""Typed intent and execution-plan models for universal browser automation."""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class AutomationDomain(str, Enum):
    SHOPPING = "shopping"
    FOOD = "food"
    TRAVEL = "travel"
    HOTEL = "hotel"
    MOVIE = "movie"
    EXAM_APPLICATION = "exam_application"
    BOOKING = "booking"
    GENERAL = "general"


@dataclass(frozen=True)
class AutomationIntent:
    original_prompt: str
    domain: AutomationDomain
    confidence: float
    matched_terms: tuple[str, ...] = ()
    constraints: dict[str, Any] = field(default_factory=dict)
    needs_clarification: bool = False
    clarification_questions: tuple[str, ...] = ()


@dataclass(frozen=True)
class AutomationPlan:
    intent: AutomationIntent
    steps: tuple[str, ...]
    requires_user_approval: bool = True
    execution_ready: bool = False
    notes: tuple[str, ...] = ()

    def to_dict(self) -> dict[str, Any]:
        return {
            "original_prompt": self.intent.original_prompt,
            "domain": self.intent.domain.value,
            "confidence": self.intent.confidence,
            "matched_terms": list(self.intent.matched_terms),
            "constraints": dict(self.intent.constraints),
            "needs_clarification": self.intent.needs_clarification,
            "clarification_questions": list(
                self.intent.clarification_questions
            ),
            "steps": list(self.steps),
            "requires_user_approval": self.requires_user_approval,
            "execution_ready": self.execution_ready,
            "notes": list(self.notes),
        }
