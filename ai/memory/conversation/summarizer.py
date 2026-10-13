"""Provider-neutral conversation summarization with explicit budget checks."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Sequence

from ..exceptions import MemoryValidationError
from .utils import ConversationMessage, estimate_tokens, normalize_content


@dataclass(frozen=True, slots=True)
class SummaryResult:
    text: str
    estimated_tokens: int
    source_message_count: int
    source_first_sequence: int | None
    source_last_sequence: int | None


class ConversationSummarizer:
    """Summarize history using an injected callable.

    The callable receives a formatted transcript and a requested token budget,
    and must return text. This class validates the result but cannot guarantee
    factual fidelity; production callers should evaluate summaries and retain
    the source messages.
    """

    def __init__(
        self,
        provider: Callable[[str, int], str],
        *,
        max_input_chars: int = 100_000,
        max_output_tokens: int = 1_000,
    ) -> None:
        if not callable(provider):
            raise MemoryValidationError("summarization provider must be callable")
        if isinstance(max_input_chars, bool) or not isinstance(max_input_chars, int) or max_input_chars < 1:
            raise MemoryValidationError("max_input_chars must be a positive integer")
        if isinstance(max_output_tokens, bool) or not isinstance(max_output_tokens, int) or max_output_tokens < 1:
            raise MemoryValidationError("max_output_tokens must be a positive integer")
        self.provider = provider
        self.max_input_chars = max_input_chars
        self.max_output_tokens = max_output_tokens

    def summarize(
        self,
        messages: Sequence[ConversationMessage],
        *,
        max_output_tokens: int | None = None,
    ) -> SummaryResult:
        budget = self.max_output_tokens if max_output_tokens is None else max_output_tokens
        if isinstance(budget, bool) or not isinstance(budget, int) or not 1 <= budget <= self.max_output_tokens:
            raise MemoryValidationError(
                f"max_output_tokens must be between 1 and {self.max_output_tokens}"
            )
        if not messages:
            raise MemoryValidationError("cannot summarize an empty conversation")
        if any(not isinstance(item, ConversationMessage) for item in messages):
            raise MemoryValidationError("messages must contain ConversationMessage objects")

        ordered = sorted(messages, key=lambda item: item.sequence)
        first = ordered[0]
        for item in ordered:
            if (
                item.tenant_id != first.tenant_id
                or item.user_id != first.user_id
                or item.conversation_id != first.conversation_id
            ):
                raise MemoryValidationError("cannot summarize messages from different scopes")
        if len({item.sequence for item in ordered}) != len(ordered):
            raise MemoryValidationError("message sequence numbers must be unique")

        transcript = "\n".join(
            f"{item.role.upper()}: {item.content}" for item in ordered
        )
        if len(transcript) > self.max_input_chars:
            raise MemoryValidationError("transcript exceeds the summarization input limit")

        summary = self.provider(transcript, budget)
        summary = normalize_content(summary)
        estimated = estimate_tokens(summary)
        if estimated > budget:
            raise MemoryValidationError(
                f"summary exceeds requested budget ({estimated} estimated tokens > {budget})"
            )

        return SummaryResult(
            text=summary,
            estimated_tokens=estimated,
            source_message_count=len(ordered),
            source_first_sequence=ordered[0].sequence,
            source_last_sequence=ordered[-1].sequence,
        )
