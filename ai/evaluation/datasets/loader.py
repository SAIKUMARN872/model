"""
Dataset loading and serialization.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any

from .dataset import (
    DatasetItem,
    EvaluationDataset,
)


class DatasetLoader:
    """Loads evaluation datasets from files."""

    def load_json(
        self,
        path: str | Path,
        name: str | None = None,
    ) -> EvaluationDataset:

        path = Path(path)

        if not path.exists():
            raise FileNotFoundError(
                f"Dataset file not found: {path}"
            )

        with path.open(
            "r",
            encoding="utf-8",
        ) as file:

            data = json.load(file)

        return self.from_data(
            data,
            name or path.stem,
        )

    def load_jsonl(
        self,
        path: str | Path,
        name: str | None = None,
    ) -> EvaluationDataset:

        path = Path(path)

        if not path.exists():
            raise FileNotFoundError(
                f"Dataset file not found: {path}"
            )

        dataset = EvaluationDataset(
            name=name or path.stem
        )

        with path.open(
            "r",
            encoding="utf-8",
        ) as file:

            for line_number, line in enumerate(
                file,
                start=1,
            ):

                line = line.strip()

                if not line:
                    continue

                try:
                    data = json.loads(line)

                except json.JSONDecodeError as exc:

                    raise ValueError(
                        f"Invalid JSON on line "
                        f"{line_number}."
                    ) from exc

                dataset.add(
                    self._item_from_dict(
                        data
                    )
                )

        return dataset

    def load_csv(
        self,
        path: str | Path,
        input_column: str = "input",
        expected_column: str = "expected_output",
        name: str | None = None,
    ) -> EvaluationDataset:

        path = Path(path)

        if not path.exists():
            raise FileNotFoundError(
                f"Dataset file not found: {path}"
            )

        dataset = EvaluationDataset(
            name=name or path.stem
        )

        with path.open(
            "r",
            encoding="utf-8",
            newline="",
        ) as file:

            reader = csv.DictReader(file)

            if reader.fieldnames is None:
                raise ValueError(
                    "CSV does not contain headers."
                )

            if input_column not in reader.fieldnames:
                raise ValueError(
                    f"Missing input column: {input_column}"
                )

            if expected_column not in reader.fieldnames:
                raise ValueError(
                    f"Missing expected column: "
                    f"{expected_column}"
                )

            for row in reader:

                dataset.add(
                    DatasetItem(
                        input_data=row[input_column],
                        expected_output=row[
                            expected_column
                        ],
                    )
                )

        return dataset

    def from_data(
        self,
        data: Any,
        name: str,
    ) -> EvaluationDataset:

        if isinstance(data, dict):

            items = data.get(
                "items",
                data.get(
                    "data",
                    [],
                ),
            )

            description = data.get(
                "description",
                "",
            )

            metadata = data.get(
                "metadata",
                {},
            )

        elif isinstance(data, list):

            items = data
            description = ""
            metadata = {}

        else:

            raise ValueError(
                "Dataset data must be a list or dictionary."
            )

        dataset = EvaluationDataset(
            name=name,
            description=description,
            metadata=metadata,
        )

        for item in items:

            if isinstance(item, dict):

                dataset.add(
                    self._item_from_dict(
                        item
                    )
                )

            elif isinstance(item, (list, tuple)):

                if len(item) < 2:
                    raise ValueError(
                        "Dataset tuple must contain input and expected output."
                    )

                dataset.add(
                    DatasetItem(
                        input_data=item[0],
                        expected_output=item[1],
                    )
                )

            else:

                dataset.add(
                    DatasetItem(
                        input_data=item
                    )
                )

        return dataset

    @staticmethod
    def _item_from_dict(
        data: dict[str, Any],
    ) -> DatasetItem:

        return DatasetItem(
            input_data=data.get(
                "input",
                data.get("input_data"),
            ),
            expected_output=data.get(
                "expected_output",
                data.get("expected"),
            ),
            item_id=data.get(
                "item_id",
                DatasetItem.__dataclass_fields__[
                    "item_id"
                ].default_factory(),
            ),
            metadata=data.get(
                "metadata",
                {},
            ),
        )

    def save_json(
        self,
        dataset: EvaluationDataset,
        path: str | Path,
    ) -> None:

        path = Path(path)

        path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        with path.open(
            "w",
            encoding="utf-8",
        ) as file:

            json.dump(
                dataset.to_dict(),
                file,
                indent=2,
                ensure_ascii=False,
                default=str,
            )