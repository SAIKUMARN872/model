from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any


class InferenceBackendType(StrEnum):
    TRANSFORMERS = "transformers"
    VLLM = "vllm"


class InferenceStatus(StrEnum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass(frozen=True)
class InferenceRequest:
    model: str
    messages: list[dict[str, Any]]
    temperature: float | None = None
    max_tokens: int | None = None
    top_p: float | None = None
    stream: bool = False
    tools: list[dict[str, Any]] | None = None
    response_format: dict[str, Any] | None = None
    stop: list[str] | None = None
    seed: int | None = None
    request_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class InferenceUsage:
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0
    estimated_cost: float = 0.0

    def __post_init__(self) -> None:
        if self.total_tokens == 0:
            object.__setattr__(
                self,
                "total_tokens",
                self.input_tokens + self.output_tokens,
            )


@dataclass(frozen=True)
class InferenceResult:
    request_id: str | None
    model: str
    backend: InferenceBackendType
    content: str
    status: InferenceStatus = InferenceStatus.COMPLETED
    usage: InferenceUsage = field(default_factory=InferenceUsage)
    latency_ms: float | None = None
    time_to_first_token_ms: float | None = None
    finish_reason: str | None = None
    tool_calls: list[dict[str, Any]] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class InferenceHealth:
    healthy: bool
    backend: InferenceBackendType
    message: str | None = None
    latency_ms: float | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
