"""
Distributed-style tracing support for automation workflows.
"""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


def generate_trace_id() -> str:
    return uuid.uuid4().hex


@dataclass
class Span:
    """Represents one execution span."""

    name: str

    trace_id: str

    span_id: str = field(
        default_factory=lambda:
        uuid.uuid4().hex
    )

    parent_span_id: str | None = None

    started_at: datetime = field(
        default_factory=lambda:
        datetime.now(timezone.utc)
    )

    ended_at: datetime | None = None

    status: str = "running"

    attributes: dict[str, Any] = field(
        default_factory=dict
    )

    events: list[dict[str, Any]] = field(
        default_factory=list
    )

    def finish(
        self,
        status: str = "completed",
    ) -> None:

        self.status = status

        self.ended_at = (
            datetime.now(timezone.utc)
        )

    @property
    def duration_ms(self) -> float:

        end = (
            self.ended_at
            or datetime.now(timezone.utc)
        )

        return (
            end - self.started_at
        ).total_seconds() * 1000

    def add_event(
        self,
        name: str,
        **attributes: Any,
    ) -> None:

        self.events.append(
            {
                "name": name,
                "timestamp": (
                    datetime.now(
                        timezone.utc
                    ).isoformat()
                ),
                "attributes": attributes,
            }
        )

    def set_attribute(
        self,
        key: str,
        value: Any,
    ) -> None:

        self.attributes[key] = value

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "name": self.name,
            "trace_id": self.trace_id,
            "span_id": self.span_id,
            "parent_span_id": (
                self.parent_span_id
            ),
            "started_at": (
                self.started_at.isoformat()
            ),
            "ended_at": (
                self.ended_at.isoformat()
                if self.ended_at
                else None
            ),
            "duration_ms": self.duration_ms,
            "status": self.status,
            "attributes": self.attributes,
            "events": self.events,
        }


class Trace:
    """Trace containing multiple spans."""

    def __init__(
        self,
        name: str,
        trace_id: str | None = None,
    ) -> None:

        self.name = name

        self.trace_id = (
            trace_id
            or generate_trace_id()
        )

        self.spans: list[Span] = []

    def start_span(
        self,
        name: str,
        parent_span_id: str | None = None,
        **attributes: Any,
    ) -> Span:

        span = Span(
            name=name,
            trace_id=self.trace_id,
            parent_span_id=parent_span_id,
            attributes=attributes,
        )

        self.spans.append(
            span
        )

        return span

    def finish(
        self,
        status: str = "completed",
    ) -> None:

        for span in self.spans:

            if span.ended_at is None:

                span.finish(
                    status
                )

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "name": self.name,
            "trace_id": self.trace_id,
            "spans": [
                span.to_dict()
                for span in self.spans
            ],
        }


class TraceManager:
    """Stores and retrieves traces."""

    def __init__(self) -> None:

        self._traces: dict[
            str,
            Trace,
        ] = {}

    def create(
        self,
        name: str,
    ) -> Trace:

        trace = Trace(name)

        self._traces[
            trace.trace_id
        ] = trace

        return trace

    def get(
        self,
        trace_id: str,
    ) -> Trace | None:

        return self._traces.get(
            trace_id
        )

    def remove(
        self,
        trace_id: str,
    ) -> Trace | None:

        return self._traces.pop(
            trace_id,
            None,
        )

    def list(
        self,
    ) -> list[Trace]:

        return list(
            self._traces.values()
        )


traces = TraceManager()