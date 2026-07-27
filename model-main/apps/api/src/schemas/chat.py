"""
Chat schemas.

Pydantic request and response models for AI chat and conversations.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    """
    Chat completion request.
    """

    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    message: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="User message.",
    )

    conversation_id: str | None = Field(
        default=None,
        description="Conversation identifier.",
    )

    model: str | None = Field(
        default=None,
        description="AI model name.",
    )

    temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=2.0,
    )

    max_tokens: int = Field(
        default=1024,
        ge=1,
        le=8192,
    )

    stream: bool = False

    metadata: dict[str, Any] = Field(
        default_factory=dict,
    )


class ChatMessage(BaseModel):
    """
    Single chat message.
    """

    model_config = ConfigDict(extra="ignore")

    id: str

    role: Literal["system", "user", "assistant", "tool"]

    content: str

    created_at: datetime


class Usage(BaseModel):
    """
    Token usage.
    """

    prompt_tokens: int

    completion_tokens: int

    total_tokens: int


class ChatResponse(BaseModel):
    """
    Chat completion response.
    """

    model_config = ConfigDict(extra="ignore")

    conversation_id: str

    message: ChatMessage

    model: str

    finish_reason: str

    usage: Usage


class ConversationResponse(BaseModel):
    """
    Conversation.
    """

    model_config = ConfigDict(extra="ignore")

    id: str

    title: str

    created_at: datetime

    updated_at: datetime

    message_count: int

    model: str


class RenameConversationRequest(BaseModel):
    """
    Rename conversation.
    """

    model_config = ConfigDict(extra="forbid")

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
    )


class ConversationHistoryResponse(BaseModel):
    """
    Complete conversation history.
    """

    model_config = ConfigDict(extra="ignore")

    conversation: ConversationResponse

    messages: list[ChatMessage]