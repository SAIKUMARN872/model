"""
Chat Commands

Enterprise CQRS Command Layer

Responsibilities:
- Create Chat
- Send Message
- Rename Chat
- Delete Chat
"""

from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from repositories.chat import ChatRepository


# ==========================================================
# Commands
# ==========================================================

@dataclass(slots=True)
class CreateChatCommand:
    user_id: UUID
    title: str


@dataclass(slots=True)
class SendMessageCommand:
    chat_id: UUID
    role: str
    content: str


@dataclass(slots=True)
class RenameChatCommand:
    chat_id: UUID
    title: str


@dataclass(slots=True)
class DeleteChatCommand:
    chat_id: UUID


# ==========================================================
# Handler
# ==========================================================

class ChatCommand:
    """
    Enterprise Chat Command Handler.
    """

    def __init__(
        self,
        session: AsyncSession,
    ) -> None:
        self.repository = ChatRepository(session)

    # --------------------------------------------------------
    # Create Chat
    # --------------------------------------------------------

    async def create_chat(
        self,
        command: CreateChatCommand,
    ):
        return await self.repository.create(
            user_id=command.user_id,
            title=command.title,
        )

    # --------------------------------------------------------
    # Rename Chat
    # --------------------------------------------------------

    async def rename_chat(
        self,
        command: RenameChatCommand,
    ):
        return await self.repository.update(
            entity_id=command.chat_id,
            title=command.title,
        )

    # --------------------------------------------------------
    # Delete Chat
    # --------------------------------------------------------

    async def delete_chat(
        self,
        command: DeleteChatCommand,
    ) -> bool:
        return await self.repository.delete(
            entity_id=command.chat_id,
        )

    # --------------------------------------------------------
    # Send Message
    # --------------------------------------------------------

    async def send_message(
        self,
        command: SendMessageCommand,
    ):
        """
        Placeholder for message creation.

        Later this method will:
        - Save user message
        - Call AI Provider
        - Save AI response
        - Track token usage
        - Publish events
        """
        return {
            "chat_id": str(command.chat_id),
            "role": command.role,
            "content": command.content,
            "status": "accepted",
        } 