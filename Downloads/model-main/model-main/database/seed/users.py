"""
Database seed for users.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext

from app.database.postgres.tables.user import User

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


DEFAULT_USERS = [
    {
        "first_name": "Admin",
        "last_name": "User",
        "username": "admin",
        "email": "admin@example.com",
        "password": "Admin@123",
        "is_active": True,
        "is_verified": True,
        "is_superuser": True,
    }
]


async def seed_users(
    session: AsyncSession,
) -> None:
    """
    Seed default users.
    """

    for user_data in DEFAULT_USERS:

        result = await session.execute(
            select(User).where(
                User.email == user_data["email"]
            )
        )

        if result.scalar_one_or_none() is None:

            password_hash = pwd_context.hash(
                user_data["password"]
            )

            session.add(
                User(
                    first_name=user_data["first_name"],
                    last_name=user_data["last_name"],
                    username=user_data["username"],
                    email=user_data["email"],
                    password_hash=password_hash,
                    is_active=user_data["is_active"],
                    is_verified=user_data["is_verified"],
                    is_superuser=user_data["is_superuser"],
                )
            )

    await session.commit()