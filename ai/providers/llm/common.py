from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, Iterator, List, Optional

from ..base.request import ChatMessage


@dataclass(frozen=True)
class LLMRequest:
    """
    Provider-neutral LLM request.

    ModelNow's routing layer creates this object.
    Individual providers translate it into their native API format.
    """

    model: str

    messages: List[ChatMessage]

    temperature: float = 0.2

    max_tokens: Optional[int] = None

    stream: bool = False

    tools: Optional[List[Dict[str, Any]]] = None

    response_format: Optional[Dict[str, Any]] = None

    metadata: Dict[str, Any] = field(
        default_factory=dict
    )


@dataclass
class LLMResponse:
    """
    Provider-neutral normalized LLM response.
    """

    provider: str

    model: str

    content: str

    input_tokens: int = 0

    output_tokens: int = 0

    total_tokens: int = 0

    estimated_cost: float = 0.0

    latency_ms: float = 0.0

    finish_reason: Optional[str] = None

    tool_calls: List[Dict[str, Any]] = field(
        default_factory=list
    )

    metadata: Dict[str, Any] = field(
        default_factory=dict
    )


@dataclass(frozen=True)
class LLMStreamChunk:
    """
    Normalized streaming event.

    Keeping streaming events provider-neutral means the
    frontend does not need to know whether the model is
    OpenAI, Anthropic, Google, DeepSeek, etc.
    """

    provider: str

    model: str

    content: str = ""

    finish_reason: Optional[str] = None

    metadata: Dict[str, Any] = field(
        default_factory=dict
    )


class LLMProviderContract:
    """
    Documentation-level contract shared by all LLM providers.

    Concrete implementations inherit from BaseProvider and
    implement generate(), stream() and health_check().
    """

    def generate(
        self,
        request: LLMRequest,
    ) -> LLMResponse:
        raise NotImplementedError

    def stream(
        self,
        request: LLMRequest,
    ) -> Iterator[LLMStreamChunk]:
        raise NotImplementedError

    def health_check(self) -> bool:
        raise NotImplementedError


