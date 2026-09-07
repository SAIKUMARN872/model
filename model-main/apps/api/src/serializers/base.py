"""
Base serializer.

Provides a reusable serializer base class for converting between
domain models, ORM models, Pydantic schemas, and dictionaries.
"""

from __future__ import annotations

from typing import Any, Generic, Iterable, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class BaseSerializer(Generic[T]):
    """
    Base serializer.

    All serializers should inherit from this class.
    """

    @classmethod
    def to_dict(cls, obj: Any) -> dict[str, Any]:
        """
        Convert an object into a dictionary.
        """

        if obj is None:
            return {}

        if isinstance(obj, BaseModel):
            return obj.model_dump(mode="json")

        if hasattr(obj, "__dict__"):
            return {
                key: value
                for key, value in vars(obj).items()
                if not key.startswith("_")
            }

        if isinstance(obj, dict):
            return obj

        raise TypeError(
            f"Unsupported object type: {type(obj).__name__}"
        )

    @classmethod
    def from_dict(
        cls,
        data: dict[str, Any],
        schema: type[T],
    ) -> T:
        """
        Convert a dictionary into a schema instance.
        """

        if issubclass(schema, BaseModel):
            return schema.model_validate(data)

        return schema(**data)

    @classmethod
    def to_schema(
        cls,
        obj: Any,
        schema: type[T],
    ) -> T:
        """
        Convert an ORM/domain object into a Pydantic schema.
        """

        if obj is None:
            return None

        if issubclass(schema, BaseModel):
            return schema.model_validate(
                obj,
                from_attributes=True,
            )

        return schema(**cls.to_dict(obj))

    @classmethod
    def to_list(
        cls,
        objects: Iterable[Any],
        schema: type[T],
    ) -> list[T]:
        """
        Serialize a collection of objects.
        """

        return [
            cls.to_schema(item, schema)
            for item in objects
        ]

    @classmethod
    def update(
        cls,
        obj: Any,
        data: dict[str, Any],
    ) -> Any:
        """
        Update an object's attributes.
        """

        for key, value in data.items():
            if hasattr(obj, key):
                setattr(obj, key, value)

        return obj

    @classmethod
    def merge(
        cls,
        obj: Any,
        schema: BaseModel,
    ) -> Any:
        """
        Merge schema values into an existing object.
        """

        values = schema.model_dump(
            exclude_unset=True,
            exclude_none=True,
        )

        return cls.update(obj, values) 