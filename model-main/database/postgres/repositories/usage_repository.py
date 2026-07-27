"""
Repository for Organization database operations.
"""

from __future__ import annotations

from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization import Organization


class OrganizationRepository:
    """
    Repository for CRUD operations on organizations.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, organization: Organization) -> Organization:
        """
        Create a new organization.
        """
        self.session.add(organization)
        await self.session.commit()
        await self.session.refresh(organization)
        return organization

    async def get_by_id(self, organization_id: int) -> Optional[Organization]:
        """
        Retrieve an organization by ID.
        """
        result = await self.session.execute(
            select(Organization).where(
                Organization.id == organization_id
            )
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Optional[Organization]:
        """
        Retrieve an organization by name.
        """
        result = await self.session.execute(
            select(Organization).where(
                Organization.name == name
            )
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> list[Organization]:
        """
        Retrieve all organizations.
        """
        result = await self.session.execute(
            select(Organization).order_by(Organization.name)
        )
        return result.scalars().all()

    async def update(
        self,
        organization: Organization,
    ) -> Organization:
        """
        Update an existing organization.
        """
        await self.session.commit()
        await self.session.refresh(organization)
        return organization

    async def delete(
        self,
        organization: Organization,
    ) -> None:
        """
        Delete an organization.
        """
        await self.session.delete(organization)
        await self.session.commit()

    async def exists(
        self,
        organization_id: int,
    ) -> bool:
        """
        Check if an organization exists.
        """
        result = await self.session.execute(
            select(Organization.id).where(
                Organization.id == organization_id
            )
        )
        return result.scalar_one_or_none() is not None

    async def count(self) -> int:
        """
        Count all organizations.
        """
        result = await self.session.execute(
            select(func.count(Organization.id))
        )
        return result.scalar_one()

    async def get_active_organizations(
        self,
    ) -> list[Organization]:
        """
        Retrieve all active organizations.
        """
        result = await self.session.execute(
            select(Organization).where(
                Organization.is_active.is_(True)
            )
        )
        return result.scalars().all()

    async def search(
        self,
        keyword: str,
    ) -> list[Organization]:
        """
        Search organizations by name.
        """
        result = await self.session.execute(
            select(Organization).where(
                Organization.name.ilike(f"%{keyword}%")
            )
        )
        return result.scalars().all()