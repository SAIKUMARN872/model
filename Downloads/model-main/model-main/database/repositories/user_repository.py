"""
Repository for user operations.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.postgres.repositories.base import BaseRepository
from app.database.postgres.tables.user import User


class UserRepository(BaseRepository[User]):
    """
    Repository for User model.
    """

    def __init__(
        self,
        session: AsyncSession,
    ) -> None:
        super().__init__(
            session=session,
            model=User,
        )

    async def get_by_email(
        self,
        email: str,
    ) -> User | None:
        """
        Retrieve a user by email.
        """
        result = await self.session.execute(
            select(User).where(
                User.email == email
            )
        )
        return result.scalar_one_or_none()

    async def get_by_username(
        self,
        username: str,
    ) -> User | None:
        """
        Retrieve a user by username.
        """
        result = await self.session.execute(
            select(User).where(
                User.username == username
            )
        )
        return result.scalar_one_or_none()

    async def get_active_users(
        self,
    ) -> list[User]:
        """
        Get all active users.
        """
        result = await self.session.execute(
            select(User).where(
                User.is_active.is_(True)
            )
        )
        return result.scalars().all()

    async def get_verified_users(
        self,
    ) -> list[User]:
        """
        Get all verified users.
        """
        result = await self.session.execute(
            select(User).where(
                User.is_verified.is_(True)
            )
        )
        return result.scalars().all()

    async def search(
        self,
        keyword: str,
    ) -> list[User]:
        """
        Search users by first name, last name, email, or username.
        """
        result = await self.session.execute(
            select(User).where(
                (User.first_name.ilike(f"%{keyword}%"))
                | (User.last_name.ilike(f"%{keyword}%"))
                | (User.email.ilike(f"%{keyword}%"))
                | (User.username.ilike(f"%{keyword}%"))
            )
        )
        return result.scalars().all()

    async def activate(
        self,
        user: User,
    ) -> User:
        """
        Activate a user account.
        """
        user.is_active = True
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def deactivate(
        self,
        user: User,
    ) -> User:
        """
        Deactivate a user account.
        """
        user.is_active = False
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def verify(
        self,
        user: User,
    ) -> User:
        """
        Mark a user as verified.
        """
        user.is_verified = True
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def update_password(
        self,
        user: User,
        password_hash: str,
    ) -> User:
        """
        Update the user's password hash.
        """
        user.password_hash = password_hash
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def make_superuser(
        self,
        user: User,
    ) -> User:
        """
        Grant superuser privileges.
        """
        user.is_superuser = True
        await self.session.commit()
        await self.session.refresh(user)
        return user