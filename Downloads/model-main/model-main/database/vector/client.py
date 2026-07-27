"""
Vector database client.
"""

from __future__ import annotations

from typing import Any

from app.core.config import settings


class VectorClient:
    """
    Base vector database client.
    """

    def __init__(self) -> None:
        self.provider = settings.VECTOR_DB_PROVIDER

    async def connect(self) -> None:
        """
        Connect to the vector database.
        """
        raise NotImplementedError

    async def disconnect(self) -> None:
        """
        Disconnect from the vector database.
        """
        raise NotImplementedError

    async def health_check(self) -> bool:
        """
        Check vector database health.
        """
        raise NotImplementedError

    async def create_collection(
        self,
        name: str,
        dimension: int,
    ) -> Any:
        raise NotImplementedError

    async def delete_collection(
        self,
        name: str,
    ) -> None:
        raise NotImplementedError

    async def list_collections(self) -> list[str]:
        raise NotImplementedError