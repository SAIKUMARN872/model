"""
Chat Repository

Enterprise Chat Data Access Layer.

Responsibilities:
- Chat CRUD
- User chat history
- Message queries
- Chat search
- Conversation management
- Async SQLAlchemy operations
"""

from __future__ import annotations

from typing import Any

from sqlalchemy import delete
from sqlalchemy import func
from sqlalchemy import select

from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Chat
from database.models import Message

from repositories.base import BaseRepository


class ChatRepository(
    BaseRepository[Chat]
):
    """
    Chat Repository.

    Handles all database operations
    related to conversations.
    """

    def __init__(
        self,
        session: AsyncSession,
    ) -> None:

        super().__init__(
            session=session,
            model=Chat,
        )


    # --------------------------------------------------
    # Get User Chats
    # --------------------------------------------------

    async def get_user_chats(
        self,
        user_id: Any,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Chat]:

        statement = (
            select(Chat)
            .where(
                Chat.user_id == user_id
            )
            .order_by(
                Chat.created_at.desc()
            )
            .limit(limit)
            .offset(offset)
        )

        result = await self.session.execute(
            statement
        )

        return list(
            result.scalars().all()
        )


    # --------------------------------------------------
    # Get Chat With Messages
    # --------------------------------------------------

    async def get_with_messages(
        self,
        chat_id: Any,
    ) -> Chat | None:

        statement = (
            select(Chat)
            .where(
                Chat.id == chat_id
            )
        )

        result = await self.session.execute(
            statement
        )

        return result.scalar_one_or_none()


    # --------------------------------------------------
    # Search Chats
    # --------------------------------------------------

    async def search(
        self,
        user_id: Any,
        keyword: str,
        limit: int = 20,
    ) -> list[Chat]:

        statement = (
            select(Chat)
            .where(
                Chat.user_id == user_id
            )
            .where(
                Chat.title.ilike(
                    f"%{keyword}%"
                )
            )
            .limit(limit)
        )


        result = await self.session.execute(
            statement
        )


        return list(
            result.scalars().all()
        )


    # --------------------------------------------------
    # Count User Chats
    # --------------------------------------------------

    async def count_user_chats(
        self,
        user_id: Any,
    ) -> int:

        statement = (
            select(func.count())
            .select_from(Chat)
            .where(
                Chat.user_id == user_id
            )
        )


        count = await self.session.scalar(
            statement
        )


        return int(count or 0)


    # --------------------------------------------------
    # Add Message
    # --------------------------------------------------

    async def add_message(
        self,
        chat_id: Any,
        role: str,
        content: str,
    ) -> Message:

        message = Message(
            chat_id=chat_id,
            role=role,
            content=content,
        )

        self.session.add(message)

        await self.session.flush()

        await self.session.refresh(
            message
        )

        return message


    # --------------------------------------------------
    # Get Messages
    # --------------------------------------------------

    async def get_messages(
        self,
        chat_id: Any,
        limit: int = 100,
    ) -> list[Message]:

        statement = (
            select(Message)
            .where(
                Message.chat_id == chat_id
            )
            .order_by(
                Message.created_at.asc()
            )
            .limit(limit)
        )


        result = await self.session.execute(
            statement
        )


        return list(
            result.scalars().all()
        )


    # --------------------------------------------------
    # Delete Conversation
    # --------------------------------------------------

    async def delete_chat(
        self,
        chat_id: Any,
    ) -> bool:

        statement = (
            delete(Chat)
            .where(
                Chat.id == chat_id
            )
        )


        result = await self.session.execute(
            statement
        )


        return result.rowcount > 0


    # --------------------------------------------------
    # Update Title
    # --------------------------------------------------

    async def update_title(
        self,
        chat_id: Any,
        title: str,
    ) -> Chat | None:

        chat = await self.get(
            chat_id
        )


        if not chat:
            return None


        chat.title = title


        await self.session.flush()

        await self.session.refresh(
            chat
        )


        return chat 