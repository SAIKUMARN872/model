"""
Synthetic evaluation dataset generation.
"""

from __future__ import annotations

import random
from typing import Any, Callable

from .dataset import (
    DatasetItem,
    EvaluationDataset,
)


class DatasetGenerator:
    """
    Generates evaluation datasets from templates or
    user-provided generator functions.
    """

    def __init__(
        self,
        seed: int | None = None,
    ) -> None:

        self.random = random.Random(
            seed
        )

    def from_pairs(
        self,
        name: str,
        pairs: list[tuple[Any, Any]],
        description: str = "",
    ) -> EvaluationDataset:

        dataset = EvaluationDataset(
            name=name,
            description=description,
        )

        for input_data, expected in pairs:

            dataset.add(
                DatasetItem(
                    input_data=input_data,
                    expected_output=expected,
                )
            )

        return dataset

    def from_inputs(
        self,
        name: str,
        inputs: list[Any],
        expected_fn: Callable[
            [Any],
            Any,
        ],
        description: str = "",
    ) -> EvaluationDataset:

        dataset = EvaluationDataset(
            name=name,
            description=description,
        )

        for input_data in inputs:

            expected = expected_fn(
                input_data
            )

            dataset.add(
                DatasetItem(
                    input_data=input_data,
                    expected_output=expected,
                )
            )

        return dataset

    def generate(
        self,
        name: str,
        generator: Callable[
            [int],
            list[tuple[Any, Any]],
        ],
        size: int,
        description: str = "",
    ) -> EvaluationDataset:

        if size <= 0:
            raise ValueError(
                "size must be positive."
            )

        pairs = generator(size)

        if len(pairs) != size:
            raise ValueError(
                "Generator did not return the requested number of items."
            )

        return self.from_pairs(
            name=name,
            pairs=pairs,
            description=description,
        )

    def sample(
        self,
        dataset: EvaluationDataset,
        size: int,
    ) -> EvaluationDataset:

        if size <= 0:
            raise ValueError(
                "size must be positive."
            )

        size = min(
            size,
            len(dataset),
        )

        selected = self.random.sample(
            dataset.items,
            size,
        )

        result = EvaluationDataset(
            name=f"{dataset.name}_sample",
            description=dataset.description,
            metadata={
                **dataset.metadata,
                "source_dataset":
                    dataset.name,
            },
        )

        for item in selected:

            result.add(
                DatasetItem(
                    input_data=item.input_data,
                    expected_output=item.expected_output,
                    metadata=dict(
                        item.metadata
                    ),
                )
            )

        return result