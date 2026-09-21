"""
Enterprise Database Session

Features
--------
✓ Request-scoped sessions
✓ Unit of Work pattern
✓ Transaction management
✓ Nested transactions (savepoints)
✓ FastAPI dependency
✓ Automatic commit / rollback
✓ Test friendly
"""

from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from .connection import database


class UnitOfWork:
    """
    Enterprise Unit of Work.

    Example
    -------
    async with UnitOfWork() as uow:
        user = await user_repo.create(...)
        chat = await chat_repo.create(...)
        # committed automatically
    """

    def __init__(self) -> None:
        self.session: AsyncSession | None = None

    async def __aenter__(self) -> "UnitOfWork":
        self._session_generator = database.session()
        self.session = await anext(self._session_generator)
        return self

    async def __aexit__(
        self,
        exc_type,
        exc,
        tb,
    ) -> None:
        try:
            if exc:
                await self.session.rollback()
            else:
                await self.session.commit()
        finally:
            await self.session.close()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI Dependency.

    Usage
    -----
    @router.get("/")
    async def endpoint(
        db: AsyncSession = Depends(get_db)
    ):
        ...
    """
    async for session in database.session():
        yield session 