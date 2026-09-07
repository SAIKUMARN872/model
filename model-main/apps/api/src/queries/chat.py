"""
Chat database queries.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat import Chat


class ChatQuery:
    """
    Chat-related database queries.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, chat_id: int) -> Chat | None:
        stmt = select(Chat).where(Chat.id == chat_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_user(self, user_id: int) -> list[Chat]:
        stmt = (
            select(Chat)
            .where(Chat.user_id == user_id)
            .order_by(Chat.created_at.desc())
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, chat: Chat) -> Chat:
        self.session.add(chat)
        await self.session.flush()
        await self.session.refresh(chat)
        return chat

    async def delete(self, chat: Chat) -> None:
        await self.session.delete(chat)