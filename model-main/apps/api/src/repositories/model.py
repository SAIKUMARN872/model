"""
AI Model Repository

Enterprise AI Model Registry Data Access.

Responsibilities:
- Model CRUD
- Model search
- Provider filtering
- Active model management
- Model availability
"""

from __future__ import annotations

from typing import Any

from sqlalchemy import func
from sqlalchemy import select

from sqlalchemy.ext.asyncio import AsyncSession

from database.models import AIModel
from database.models import Provider

from repositories.base import BaseRepository


class ModelRepository(
    BaseRepository[AIModel]
):
    """
    AI Model Repository.
    """

    def __init__(
        self,
        session: AsyncSession,
    ) -> None:

        super().__init__(
            session=session,
            model=AIModel,
        )


    # --------------------------------------------------
    # Get Model By Name
    # --------------------------------------------------

    async def get_by_name(
        self,
        name: str,
    ) -> AIModel | None:

        statement = (
            select(AIModel)
            .where(
                AIModel.name == name
            )
        )

        result = await self.session.execute(
            statement
        )

        return result.scalar_one_or_none()


    # --------------------------------------------------
    # Get Active Models
    # --------------------------------------------------

    async def get_active_models(
        self,
        limit: int = 100,
    ) -> list[AIModel]:

        statement = (
            select(AIModel)
            .where(
                AIModel.is_active.is_(True)
            )
            .order_by(
                AIModel.created_at.desc()
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
    # Models By Provider
    # --------------------------------------------------

    async def get_by_provider(
        self,
        provider_id: Any,
    ) -> list[AIModel]:

        statement = (
            select(AIModel)
            .where(
                AIModel.provider_id == provider_id
            )
            .where(
                AIModel.is_active.is_(True)
            )
        )


        result = await self.session.execute(
            statement
        )


        return list(
            result.scalars().all()
        )


    # --------------------------------------------------
    # Search Models
    # --------------------------------------------------

    async def search(
        self,
        keyword: str,
        limit: int = 20,
    ) -> list[AIModel]:

        statement = (
            select(AIModel)
            .where(
                AIModel.name.ilike(
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
    # Model With Provider
    # --------------------------------------------------

    async def get_with_provider(
        self,
        model_id: Any,
    ) -> AIModel | None:

        statement = (
            select(AIModel)
            .where(
                AIModel.id == model_id
            )
        )


        result = await self.session.execute(
            statement
        )


        return result.scalar_one_or_none()


    # --------------------------------------------------
    # Count Models
    # --------------------------------------------------

    async def count_active(
        self,
    ) -> int:

        statement = (
            select(func.count())
            .select_from(AIModel)
            .where(
                AIModel.is_active.is_(True)
            )
        )


        count = await self.session.scalar(
            statement
        )


        return int(count or 0)


    # --------------------------------------------------
    # Enable / Disable Model
    # --------------------------------------------------

    async def set_status(
        self,
        model_id: Any,
        status: bool,
    ) -> AIModel | None:

        model = await self.get(
            model_id
        )


        if not model:
            return None


        model.is_active = status


        await self.session.flush()

        await self.session.refresh(
            model
        )


        return model


    # --------------------------------------------------
    # Get Default Model
    # --------------------------------------------------

    async def get_default_model(
        self,
    ) -> AIModel | None:

        statement = (
            select(AIModel)
            .where(
                AIModel.is_default.is_(True)
            )
            .where(
                AIModel.is_active.is_(True)
            )
            .limit(1)
        )


        result = await self.session.execute(
            statement
        )


        return result.scalar_one_or_none() 