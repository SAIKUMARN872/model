from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(min_length=1)
    content: str = ""


class ChatRequest(BaseModel):
    model: str | None = None
    messages: list[ChatMessage] = Field(default_factory=list)

    objective: str | None = None

    max_cost: float | None = Field(default=None, ge=0)
    max_latency_ms: float | None = Field(default=None, ge=0)
    min_quality: float | None = Field(default=None, ge=0, le=1)

    required_capabilities: list[str] = Field(default_factory=list)
    preferred_tier: str | None = None

    stream: bool = False

    request_id: str | None = None
    task_type: str | None = None

    metadata: dict[str, Any] = Field(default_factory=dict)

    reference: str | None = None
    required_terms: list[str] = Field(default_factory=list)

    relevance: float | None = Field(default=None, ge=0, le=1)
    correctness: float | None = Field(default=None, ge=0, le=1)
    completeness: float | None = Field(default=None, ge=0, le=1)
    coherence: float | None = Field(default=None, ge=0, le=1)

    target_latency_ms: float | None = Field(default=None, ge=0)
    target_cost: float | None = Field(default=None, ge=0)


class ChatUsageResponse(BaseModel):
    input_tokens: int
    output_tokens: int
    total_tokens: int
    estimated_cost: float


class ChatResponse(BaseModel):
    request_id: str | None
    model: str
    backend: str
    content: str
    status: str

    latency_ms: float | None
    time_to_first_token_ms: float | None
    finish_reason: str | None

    usage: ChatUsageResponse

    tool_calls: list[dict[str, Any]]
    metadata: dict[str, Any]


class ModelResponse(BaseModel):
    provider: str
    model_id: str
    display_name: str
    tier: str
    context_window: int
    max_output_tokens: int
    enabled: bool
    available: bool


__all__ = [
    "ChatMessage",
    "ChatRequest",
    "ChatUsageResponse",
    "ChatResponse",
    "ModelResponse",
]
