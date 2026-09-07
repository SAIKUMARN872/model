"""
Repository Interface

Defines the contract for data access layers.

Implemented by:
- SQLAlchemy Repository
- Mongo Repository
- Vector Database Repository
"""

from abc import ABC, abstractmethod
from typing import Any, Generic, List, Optional, TypeVar


T = TypeVar("T")


class IRepository(
    ABC,
    Generic[T],
):
    """
    Generic repository interface.
    """


    @abstractmethod
    async def create(
        self,
        entity: T,
    ) -> T:
        """
        Create a new entity.
        """
        pass



    @abstractmethod
    async def get_by_id(
        self,
        entity_id: Any,
    ) -> Optional[T]:
        """
        Get entity by ID.
        """
        pass



    @abstractmethod
    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> List[T]:
        """
        Get list of entities.
        """
        pass



    @abstractmethod
    async def update(
        self,
        entity_id: Any,
        data: dict,
    ) -> Optional[T]:
        """
        Update existing entity.
        """
        pass



    @abstractmethod
    async def delete(
        self,
        entity_id: Any,
    ) -> bool:
        """
        Delete entity.
        """
        pass



    @abstractmethod
    async def exists(
        self,
        entity_id: Any,
    ) -> bool:
        """
        Check entity existence.
        """
        pass



    @abstractmethod
    async def count(
        self,
        filters: Optional[dict] = None,
    ) -> int:
        """
        Count records.
        """
        pass



    @abstractmethod
    async def find(
        self,
        filters: dict,
        skip: int = 0,
        limit: int = 100,
    ) -> List[T]:
        """
        Dynamic filtering query.
        """
        pass 