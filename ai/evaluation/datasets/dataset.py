"""
Dataset models for AI evaluation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Iterator
from uuid import uuid4


@dataclass
class DatasetItem:
    """One evaluation dataset sample."""

    input_data: Any

    expected_output: Any = None

    item_id: str = field(
        default_factory=lambda:
        f"item_{uuid4().hex}"
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "item_id": self.item_id,
            "input": self.input_data,
            "expected_output": self.expected_output,
            "metadata": self.metadata,
        }


@dataclass
class EvaluationDataset:
    """Collection of evaluation samples."""

    name: str

    items: list[DatasetItem] = field(
        default_factory=list
    )

    description: str = ""

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        self.name = self.name.strip()

        if not self.name:
            raise ValueError(
                "Dataset name cannot be empty."
            )

    def add(
        self,
        item: DatasetItem,
    ) -> None:

        if any(
            existing.item_id == item.item_id
            for existing in self.items
        ):
            raise ValueError(
                f"Dataset item '{item.item_id}' already exists."
            )

        self.items.append(item)

    def remove(
        self,
        item_id: str,
    ) -> DatasetItem | None:

        for index, item in enumerate(
            self.items
        ):

            if item.item_id == item_id:
                return self.items.pop(index)

        return None

    def get(
        self,
        item_id: str,
    ) -> DatasetItem | None:

        for item in self.items:

            if item.item_id == item_id:
                return item

        return None

    def __len__(self) -> int:
        return len(self.items)

    def __iter__(
        self,
    ) -> Iterator[DatasetItem]:

        return iter(self.items)

    def batch(
        self,
        size: int,
    ) -> list[list[DatasetItem]]:

        if size <= 0:
            raise ValueError(
                "Batch size must be positive."
            )

        return [
            self.items[index:index + size]
            for index in range(
                0,
                len(self.items),
                size,
            )
        ]

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "name": self.name,
            "description": self.description,
            "size": len(self.items),
            "items": [
                item.to_dict()
                for item in self.items
            ],
            "metadata": self.metadata,
        }