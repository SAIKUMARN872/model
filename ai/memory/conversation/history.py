"""Repository contracts and bounded conversation history access."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol, Sequence

from ..exceptions import MemoryNotFoundError, MemoryValidationError
from .utils import Conversation, ConversationMessage, validate_identifier


class ConversationRepository(Protocol):
    """Persistence contract; implementations must enforce scope atomically."""

    def create(self, conversation: Conversation) -> Conversation: ...
    def get(self, tenant_id: str, user_id: str, conversation_id: str) -> Conversation | None: ...
    def save(self, conversation: Conversation, expected_version: int) -> Conversation: ...
    def append_message(self, message: ConversationMessage, expected_version: int) -> ConversationMessage: ...
    def list_messages(
        self, tenant_id: str, user_id: str, conversation_id: str,
        *, before_sequence: int | None, limit: int,
    ) -> list[ConversationMessage]: ...
    def delete(self, tenant_id: str, user_id: str, conversation_id: str) -> bool: ...


@dataclass(frozen=True, slots=True)
class HistoryPage:
    messages: tuple[ConversationMessage, ...]
    has_more: bool
    next_before_sequence: int | None


class ConversationHistory:
    """Paginated chronological history facade over a scoped repository."""

    def __init__(
        self,
        repository: ConversationRepository,
        *,
        tenant_id: str,
        user_id: str,
        max_page_size: int = 200,
    ) -> None:
        if repository is None:
            raise MemoryValidationError("repository is required")
        if isinstance(max_page_size, bool) or not isinstance(max_page_size, int) or max_page_size < 1:
            raise MemoryValidationError("max_page_size must be a positive integer")
        self.repository = repository
        self.tenant_id = validate_identifier(tenant_id, "tenant_id")
        self.user_id = validate_identifier(user_id, "user_id")
        self.max_page_size = max_page_size

    def page(
        self,
        conversation_id: str,
        *,
        limit: int = 50,
        before_sequence: int | None = None,
    ) -> HistoryPage:
        conversation_id = validate_identifier(conversation_id, "conversation_id")
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= self.max_page_size:
            raise MemoryValidationError(f"limit must be between 1 and {self.max_page_size}")
        if before_sequence is not None and (
            isinstance(before_sequence, bool)
            or not isinstance(before_sequence, int)
            or before_sequence < 1
        ):
            raise MemoryValidationError("before_sequence must be a positive integer")

        conversation = self.repository.get(self.tenant_id, self.user_id, conversation_id)
        if conversation is None:
            raise MemoryNotFoundError("Conversation was not found")

        fetched = self.repository.list_messages(
            self.tenant_id,
            self.user_id,
            conversation_id,
            before_sequence=before_sequence,
            limit=limit + 1,
        )
        # Repository results must be chronological and unique.
        fetched = sorted(fetched, key=lambda item: item.sequence)
        if any(
            item.tenant_id != self.tenant_id
            or item.user_id != self.user_id
            or item.conversation_id != conversation_id
            for item in fetched
        ):
            raise MemoryValidationError("Repository returned data outside the requested scope")
        if len({item.sequence for item in fetched}) != len(fetched):
            raise MemoryValidationError("Repository returned duplicate message sequences")

        has_more = len(fetched) > limit

        # The repository returns the newest eligible messages in ascending
        # sequence order. When it returns limit + 1 rows, discard the oldest
        # extra row so the first page contains the most recent messages.
        selected = fetched[-limit:] if has_more else fetched
        next_cursor = selected[0].sequence if has_more and selected else None
        return HistoryPage(tuple(selected), has_more, next_cursor)

    def all_recent(self, conversation_id: str, *, limit: int = 50) -> list[ConversationMessage]:
        return list(self.page(conversation_id, limit=limit).messages)

