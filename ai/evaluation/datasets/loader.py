"""JSON and JSONL dataset loading and saving."""
import json
from pathlib import Path
from typing import Any

from ai.evaluation.exceptions import EvaluationValidationError
from ai.evaluation.datasets.dataset import (
    DatasetCase,
    EvaluationDataset,
    validate_dataset,
)


def _parse_case(data: Any) -> DatasetCase:
    if not isinstance(data, dict):
        raise EvaluationValidationError("each dataset case must be a JSON object.")

    allowed = {"case_id", "input_text", "reference_answer", "context", "metadata"}
    unknown = set(data) - allowed

    if unknown:
        raise EvaluationValidationError(
            f"unknown dataset case fields: {', '.join(sorted(unknown))}"
        )

    if "case_id" not in data or "input_text" not in data:
        raise EvaluationValidationError(
            "each case requires case_id and input_text."
        )

    try:
        case = DatasetCase(
            case_id=data["case_id"],
            input_text=data["input_text"],
            reference_answer=data.get("reference_answer"),
            context=data.get("context"),
            metadata=data.get("metadata", {}),
        )
    except (TypeError, ValueError) as exc:
        raise EvaluationValidationError(f"invalid dataset case: {exc}") from exc

    from ai.evaluation.datasets.dataset import validate_dataset_case
    return validate_dataset_case(case)


def load_dataset(path: str | Path, name: str | None = None) -> EvaluationDataset:
    """Load a JSON dataset object or a JSONL file containing case objects."""
    file_path = Path(path)

    if not file_path.exists():
        raise EvaluationValidationError(f"dataset file does not exist: {file_path}")

    if not file_path.is_file():
        raise EvaluationValidationError(f"dataset path is not a file: {file_path}")

    suffix = file_path.suffix.lower()

    if suffix not in {".json", ".jsonl"}:
        raise EvaluationValidationError("dataset file must use .json or .jsonl.")

    try:
        content = file_path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        raise EvaluationValidationError(f"cannot read dataset file: {exc}") from exc

    try:
        if suffix == ".json":
            raw = json.loads(content)

            if not isinstance(raw, dict):
                raise EvaluationValidationError(
                    "JSON dataset must be an object containing a cases array."
                )

            unknown = set(raw) - {"name", "cases", "metadata"}
            if unknown:
                raise EvaluationValidationError(
                    f"unknown dataset fields: {', '.join(sorted(unknown))}"
                )

            if not isinstance(raw.get("cases"), list):
                raise EvaluationValidationError("JSON dataset cases must be a list.")

            dataset_name = name if name is not None else raw.get("name", file_path.stem)
            dataset_metadata = raw.get("metadata", {})
            raw_cases = raw["cases"]

        else:
            raw_cases = []
            for line_number, line in enumerate(content.splitlines(), start=1):
                if not line.strip():
                    continue
                try:
                    raw_cases.append(json.loads(line))
                except json.JSONDecodeError as exc:
                    raise EvaluationValidationError(
                        f"invalid JSONL at line {line_number}: {exc.msg}"
                    ) from exc

            dataset_name = name if name is not None else file_path.stem
            dataset_metadata = {"source_format": "jsonl"}

    except json.JSONDecodeError as exc:
        raise EvaluationValidationError(
            f"invalid JSON dataset: {exc.msg}"
        ) from exc

    if not isinstance(dataset_name, str) or not dataset_name.strip():
        raise EvaluationValidationError("dataset name must be non-empty.")

    if not isinstance(dataset_metadata, dict):
        raise EvaluationValidationError("dataset metadata must be an object.")

    cases = tuple(_parse_case(item) for item in raw_cases)

    return validate_dataset(
        EvaluationDataset(
            name=dataset_name,
            cases=cases,
            metadata=dataset_metadata,
        )
    )


def save_dataset(dataset: EvaluationDataset, path: str | Path) -> Path:
    """Save a validated dataset as JSON or JSONL."""
    validate_dataset(dataset)
    file_path = Path(path)
    suffix = file_path.suffix.lower()

    if suffix not in {".json", ".jsonl"}:
        raise EvaluationValidationError("output file must use .json or .jsonl.")

    file_path.parent.mkdir(parents=True, exist_ok=True)

    records = [
        {
            "case_id": case.case_id,
            "input_text": case.input_text,
            "reference_answer": case.reference_answer,
            "context": case.context,
            "metadata": case.metadata,
        }
        for case in dataset.cases
    ]

    try:
        if suffix == ".json":
            payload = {
                "name": dataset.name,
                "metadata": dataset.metadata,
                "cases": records,
            }
            serialized = json.dumps(
                payload, ensure_ascii=False, indent=2, allow_nan=False
            )
        else:
            serialized = "\n".join(
                json.dumps(record, ensure_ascii=False, allow_nan=False)
                for record in records
            ) + "\n"

        file_path.write_text(serialized, encoding="utf-8")
    except (OSError, TypeError, ValueError) as exc:
        raise EvaluationValidationError(
            f"cannot save dataset: {exc}"
        ) from exc

    return file_path
