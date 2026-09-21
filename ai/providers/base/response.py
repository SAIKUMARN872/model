from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class ChatUsage:
    """
    Token and cost usage information for a model request.
    """

    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0

    estimated_cost: float = 0.0

    cached_input_tokens: int = 0
    reasoning_tokens: int = 0

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:
        if self.total_tokens == 0:
            self.total_tokens = (
                self.input_tokens
                + self.output_tokens
            )


@dataclass
class ChatResponse:
    """
    Normalized response returned by a ModelNow provider.
    """

    provider: str
    model: str

    content: str = ""

    usage: ChatUsage = field(
        default_factory=ChatUsage
    )

    latency_ms: float | None = None
    time_to_first_token_ms: float | None = None

    finish_reason: str | None = None

    request_id: str | None = None

    tool_calls: list[dict[str, Any]] = field(
        default_factory=list
    )

    citations: list[dict[str, Any]] = field(
        default_factory=list
    )

    raw_response: Any = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


@dataclass
class StreamChunk:
    """
    Normalized streaming chunk returned by a ModelNow provider.

    Providers convert their native streaming events into
    this common representation.
    """

    content: str = ""

    provider: str | None = None
    model: str | None = None

    request_id: str | None = None

    finish_reason: str | None = None

    usage: ChatUsage | None = None

    tool_calls: list[dict[str, Any]] = field(
        default_factory=list
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    done: bool = False

