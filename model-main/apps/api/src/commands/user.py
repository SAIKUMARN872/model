"""
User Commands

Enterprise CQRS Command Layer

Responsibilities
----------------
- Create User
- Update User
- Change Password
- Activate User
- Deactivate User
- Delete User
"""

from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from repositories.user import UserRepository


# ==========================================================
# Commands
# ==========================================================

@dataclass(slots=True)
class CreateUserCommand:
    email: str
    username: str
    full_name: str
    hashed_password: str


@dataclass(slots=True)
class UpdateUserCommand:
    user_id: UUID
    full_name: str | None = None
    username: str | None = None
    email: str | None = None


@dataclass(slots=True)
class ChangePasswordCommand:
    user_id: UUID
    hashed_password: str


@dataclass(slots=True)
class ActivateUserCommand:
    user_id: UUID


@dataclass(slots=True)
class DeactivateUserCommand:
    user_id: UUID


@dataclass(slots=True)
class DeleteUserCommand:
    user_id: UUID


# ==========================================================
# Command Handler
# ==========================================================

class UserCommand:
    """
    Enterprise User Command Handler.
    """

    def __init__(
        self,
        session: AsyncSession,
    ) -> None:
        self.repository = UserRepository(session)

    # ------------------------------------------------------
    # Create User
    # ------------------------------------------------------

    async def create(
        self,
        command: CreateUserCommand,
    ):
        return await self.repository.create(
            email=command.email,
            username=command.username,
            full_name=command.full_name,
            hashed_password=command.hashed_password,
            is_active=True,
            is_superuser=False,
        )

    # ------------------------------------------------------
    # Update User
    # ------------------------------------------------------

    async def update(
        self,
        command: UpdateUserCommand,
    ):
        values = {}

        if command.full_name is not None:
            values["full_name"] = command.full_name

        if command.username is not None:
            values["username"] = command.username

        if command.email is not None:
            values["email"] = command.email

        return await self.repository.update(
            entity_id=command.user_id,
            **values,
        )

    # ------------------------------------------------------
    # Change Password
    # ------------------------------------------------------

    async def change_password(
        self,
        command: ChangePasswordCommand,
    ):
        return await self.repository.update(
            entity_id=command.user_id,
            hashed_password=command.hashed_password,
        )

    # ------------------------------------------------------
    # Activate User
    # ------------------------------------------------------

    async def activate(
        self,
        command: ActivateUserCommand,
    ):
        return await self.repository.update(
            entity_id=command.user_id,
            is_active=True,
        )

    # ------------------------------------------------------
    # Deactivate User
    # ------------------------------------------------------

    async def deactivate(
        self,
        command: DeactivateUserCommand,
    ):
        return await self.repository.update(
            entity_id=command.user_id,
            is_active=False,
        )

    # ------------------------------------------------------
    # Delete User
    # ------------------------------------------------------

    async def delete(
        self,
        command: DeleteUserCommand,
    ) -> bool:
        return await self.repository.delete(
            entity_id=command.user_id,
        ) 