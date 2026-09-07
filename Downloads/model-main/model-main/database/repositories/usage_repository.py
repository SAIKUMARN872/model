"""
Repository for model usage operations.
"""

from __future__ import annotations

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.postgres.repositories.base import BaseRepository
from app.database.postgres.tables.model_usage import ModelUsage


class UsageRepository(BaseRepository[ModelUsage]):
    """
    Repository for AI model usage.
    """

    def __init__(
        self,
        session: AsyncSession,
    ) -> None:
        super().__init__(
            session=session,
            model=ModelUsage,
        )

    async def get_by_user(
        self,
        user_id: int,
    ) -> list[ModelUsage]:
        """
        Get usage records for a user.
        """
        result = await self.session.execute(
            select(ModelUsage).where(
                ModelUsage.user_id == user_id
            )
        )
        return result.scalars().all()

    async def get_by_organization(
        self,
        organization_id: int,
    ) -> list[ModelUsage]:
        """
        Get usage records for an organization.
        """
        result = await self.session.execute(
            select(ModelUsage).where(
                ModelUsage.organization_id == organization_id
            )
        )
        return result.scalars().all()

    async def get_by_model(
        self,
        model_id: int,
    ) -> list[ModelUsage]:
        """
        Get usage records for a model.
        """
        result = await self.session.execute(
            select(ModelUsage).where(
                ModelUsage.model_id == model_id
            )
        )
        return result.scalars().all()

    async def get_recent(
        self,
        limit: int = 10,
    ) -> list[ModelUsage]:
        """
        Get the most recent usage records.
        """
        result = await self.session.execute(
            select(ModelUsage)
            .order_by(desc(ModelUsage.created_at))
            .limit(limit)
        )
        return result.scalars().all()

    async def total_tokens_by_user(
        self,
        user_id: int,
    ) -> int:
        """
        Calculate total tokens consumed by a user.
        """
        result = await self.session.execute(
            select(
                func.coalesce(
                    func.sum(ModelUsage.total_tokens),
                    0,
                )
            ).where(
                ModelUsage.user_id == user_id
            )
        )
        return result.scalar_one()

    async def total_cost_by_user(
        self,
        user_id: int,
    ) -> float:
        """
        Calculate total cost for a user.
        """
        result = await self.session.execute(
            select(
                func.coalesce(
                    func.sum(ModelUsage.cost),
                    0,
                )
            ).where(
                ModelUsage.user_id == user_id
            )
        )
        return float(result.scalar_one())

    async def total_tokens_by_organization(
        self,
        organization_id: int,
    ) -> int:
        """
        Calculate total tokens consumed by an organization.
        """
        result = await self.session.execute(
            select(
                func.coalesce(
                    func.sum(ModelUsage.total_tokens),
                    0,
                )
            ).where(
                ModelUsage.organization_id == organization_id
            )
        )
        return result.scalar_one()

    async def total_cost_by_organization(
        self,
        organization_id: int,
    ) -> float:
        """
        Calculate total cost for an organization.
        """
        result = await self.session.execute(
            select(
                func.coalesce(
                    func.sum(ModelUsage.cost),
                    0,
                )
            ).where(
                ModelUsage.organization_id == organization_id
            )
        )
        return float(result.scalar_one())