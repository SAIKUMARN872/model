"""
User Repository

Enterprise User Data Access Layer.

Responsibilities:
- User CRUD
- Authentication lookup
- User search
- Organization filtering
- User status management
"""

from __future__ import annotations

from typing import Any

from sqlalchemy import func
from sqlalchemy import select

from sqlalchemy.ext.asyncio import AsyncSession

from database.models import User

from repositories.base import BaseRepository


class UserRepository(
    BaseRepository[User]
):
    """
    User Repository.
    """

    def __init__(
        self,
        session: AsyncSession,
    ) -> None:

        super().__init__(
            session=session,
            model=User,
        )


    # --------------------------------------------------
    # Find By Email
    # --------------------------------------------------

    async def get_by_email(
        self,
        email: str,
    ) -> User | None:

        statement = (
            select(User)
            .where(
                User.email == email
            )
        )

        result = await self.session.execute(
            statement
        )

        return result.scalar_one_or_none()


    # --------------------------------------------------
    # Find By Username
    # --------------------------------------------------

    async def get_by_username(
        self,
        username: str,
    ) -> User | None:

        statement = (
            select(User)
            .where(
                User.username == username
            )
        )

        result = await self.session.execute(
            statement
        )

        return result.scalar_one_or_none()


    # --------------------------------------------------
    # Authentication Lookup
    # --------------------------------------------------

    async def get_for_authentication(
        self,
        email: str,
    ) -> User | None:

        statement = (
            select(User)
            .where(
                User.email == email
            )
            .where(
                User.is_active.is_(True)
            )
        )

        result = await self.session.execute(
            statement
        )

        return result.scalar_one_or_none()


    # --------------------------------------------------
    # Search Users
    # --------------------------------------------------

    async def search(
        self,
        keyword: str,
        limit: int = 20,
    ) -> list[User]:

        statement = (
            select(User)
            .where(
                (
                    User.email.ilike(
                        f"%{keyword}%"
                    )
                )
                |
                (
                    User.username.ilike(
                        f"%{keyword}%"
                    )
                )
                |
                (
                    User.full_name.ilike(
                        f"%{keyword}%"
                    )
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
    # Organization Users
    # --------------------------------------------------

    async def get_by_organization(
        self,
        organization_id: Any,
    ) -> list[User]:

        statement = (
            select(User)
            .where(
                User.organization_id
                == organization_id
            )
        )

        result = await self.session.execute(
            statement
        )


        return list(
            result.scalars().all()
        )


    # --------------------------------------------------
    # Active Users
    # --------------------------------------------------

    async def get_active_users(
        self,
        limit: int = 100,
    ) -> list[User]:

        statement = (
            select(User)
            .where(
                User.is_active.is_(True)
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
    # Count Users
    # --------------------------------------------------

    async def count_active_users(
        self,
    ) -> int:

        statement = (
            select(func.count())
            .select_from(User)
            .where(
                User.is_active.is_(True)
            )
        )

        count = await self.session.scalar(
            statement
        )

        return int(count or 0)


    # --------------------------------------------------
    # Activate User
    # --------------------------------------------------

    async def activate(
        self,
        user_id: Any,
    ) -> User | None:

        user = await self.get(
            user_id
        )

        if not user:
            return None


        user.is_active = True


        await self.session.flush()

        await self.session.refresh(
            user
        )

        return user


    # --------------------------------------------------
    # Deactivate User
    # --------------------------------------------------

    async def deactivate(
        self,
        user_id: Any,
    ) -> User | None:

        user = await self.get(
            user_id
        )

        if not user:
            return None


        user.is_active = False


        await self.session.flush()

        await self.session.refresh(
            user
        )

        return user 
