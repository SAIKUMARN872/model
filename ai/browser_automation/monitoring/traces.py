"""Lightweight trace and span context for browser automation."""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Any


@dataclass
class TraceSpan:
    name: str
    trace_id: str
    span_id: str = field(default_factory=lambda: uuid.uuid4().hex)
    parent_span_id: str | None = None
    attributes: dict[str, Any] = field(default_factory=dict)
    started_at: float = field(default_factory=time.monotonic)
    ended_at: float | None = None
    error: str | None = None

    @property
    def duration_seconds(self) -> float | None:
        if self.ended_at is None:
            return None
        return max(0.0, self.ended_at - self.started_at)

    @property
    def finished(self) -> bool:
        return self.ended_at is not None

    def finish(self, error: str | None = None) -> "TraceSpan":
        if self.ended_at is None:
            self.ended_at = time.monotonic()
        if error is not None:
            self.error = str(error)[:500]
        return self

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "trace_id": self.trace_id,
            "span_id": self.span_id,
            "parent_span_id": self.parent_span_id,
            "attributes": dict(self.attributes),
            "duration_seconds": self.duration_seconds,
            "finished": self.finished,
            "error": self.error,
        }


class TraceManager:
    """Create related spans without requiring an external tracing service."""

    def start_trace(self, name: str = "browser_task") -> TraceSpan:
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Trace name must be non-empty.")
        return TraceSpan(name=name, trace_id=uuid.uuid4().hex)

    def start_span(
        self,
        name: str,
        parent: TraceSpan,
        *,
        attributes: dict[str, Any] | None = None,
    ) -> TraceSpan:
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Span name must be non-empty.")
        if not isinstance(parent, TraceSpan):
            raise TypeError("parent must be a TraceSpan.")
        return TraceSpan(
            name=name,
            trace_id=parent.trace_id,
            parent_span_id=parent.span_id,
            attributes=dict(attributes or {}),
        )
