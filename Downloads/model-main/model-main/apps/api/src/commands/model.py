"""
Model Commands

Enterprise CQRS Command Layer

Responsibilities
----------------
- Register AI Model
- Update AI Model
- Delete AI Model
- Enable / Disable Model
"""

from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from repositories.model import ModelRepository


# ==========================================================
# Commands
# ==========================================================

@dataclass(slots=True)
class RegisterModelCommand:
    provider: str
    model_name: str
    display_name: str
    context_window: int
    max_tokens: int
    enabled: bool = True


@dataclass(slots=True)
class UpdateModelCommand:
    model_id: UUID
    display_name: str | None = None
    context_window: int | None = None
    max_tokens: int | None = None
    enabled: bool | None = None


@dataclass(slots=True)
class DeleteModelCommand:
    model_id: UUID


@dataclass(slots=True)
class EnableModelCommand:
    model_id: UUID


@dataclass(slots=True)
class DisableModelCommand:
    model_id: UUID


# ==========================================================
# Command Handler
# ==========================================================

class ModelCommand:
    """
    Enterprise Model Command Handler.
    """

    def __init__(
        self,
        session: AsyncSession,
    ) -> None:

        self.repository = ModelRepository(session)

    # ------------------------------------------------------
    # Register Model
    # ------------------------------------------------------

    async def register(
        self,
        command: RegisterModelCommand,
    ):
        return await self.repository.create(
            provider=command.provider,
            model_name=command.model_name,
            display_name=command.display_name,
            context_window=command.context_window,
            max_tokens=command.max_tokens,
            enabled=command.enabled,
        )

    # ------------------------------------------------------
    # Update Model
    # ------------------------------------------------------

    async def update(
        self,
        command: UpdateModelCommand,
    ):

        values = {}

        if command.display_name is not None:
            values["display_name"] = command.display_name

        if command.context_window is not None:
            values["context_window"] = command.context_window

        if command.max_tokens is not None:
            values["max_tokens"] = command.max_tokens

        if command.enabled is not None:
            values["enabled"] = command.enabled

        return await self.repository.update(
            entity_id=command.model_id,
            **values,
        )

    # ------------------------------------------------------
    # Enable Model
    # ------------------------------------------------------

    async def enable(
        self,
        command: EnableModelCommand,
    ):
        return await self.repository.update(
            entity_id=command.model_id,
            enabled=True,
        )

    # ------------------------------------------------------
    # Disable Model
    # ------------------------------------------------------

    async def disable(
        self,
        command: DisableModelCommand,
    ):
        return await self.repository.update(
            entity_id=command.model_id,
            enabled=False,
        )

    # ------------------------------------------------------
    # Delete Model
    # ------------------------------------------------------

    async def delete(
        self,
        command: DeleteModelCommand,
    ) -> bool:
        return await self.repository.delete(
            entity_id=command.model_id,
        ) 