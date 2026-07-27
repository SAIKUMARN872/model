"""
Collection management.
"""

from __future__ import annotations

from typing import Any

from .client import VectorClient


class CollectionManager:
    """
    Manage vector collections.
    """

    def __init__(
        self,
        client: VectorClient,
    ) -> None:
        self.client = client

    async def create(
        self,
        name: str,
        dimension: int,
    ) -> Any:
        return await self.client.create_collection(
            name,
            dimension,
        )

    async def delete(
        self,
        name: str,
    ) -> None:
        await self.client.delete_collection(name)

    async def list(self) -> list[str]:
        return await self.client.list_collections()