"""Deterministic synthetic dataset generation for ModelNow."""
import random

from ai.evaluation.exceptions import EvaluationValidationError
from ai.evaluation.datasets.dataset import DatasetCase, EvaluationDataset, validate_dataset


def generate_synthetic_dataset(
    count: int = 20,
    seed: int = 42,
    name: str = "synthetic-arithmetic",
) -> EvaluationDataset:
    """Generate reproducible arithmetic cases with verifiable answers."""
    if isinstance(count, bool) or not isinstance(count, int) or count < 1:
        raise EvaluationValidationError("count must be a positive integer.")

    if isinstance(seed, bool) or not isinstance(seed, int):
        raise EvaluationValidationError("seed must be an integer.")

    if not isinstance(name, str) or not name.strip():
        raise EvaluationValidationError("name must be non-empty.")

    rng = random.Random(seed)
    cases = []

    for index in range(count):
        operation = index % 3
        a = rng.randint(1, 100)
        b = rng.randint(1, 100)

        if operation == 0:
            question = f"What is {a} + {b}?"
            answer = str(a + b)
            operation_name = "addition"
        elif operation == 1:
            question = f"What is {a} - {b}?"
            answer = str(a - b)
            operation_name = "subtraction"
        else:
            question = f"What is {a} multiplied by {b}?"
            answer = str(a * b)
            operation_name = "multiplication"

        cases.append(
            DatasetCase(
                case_id=f"synthetic-{index + 1:04d}",
                input_text=question,
                reference_answer=answer,
                metadata={
                    "task_type": "arithmetic",
                    "operation": operation_name,
                    "synthetic": True,
                    "generator_seed": seed,
                },
            )
        )

    dataset = EvaluationDataset(
        name=name,
        cases=tuple(cases),
        metadata={
            "source": "modelnow_synthetic_generator",
            "seed": seed,
            "case_count": count,
            "purpose": "deterministic arithmetic evaluation",
        },
    )

    return validate_dataset(dataset)


def generate_cases(count: int = 20, seed: int = 42) -> list[DatasetCase]:
    """Convenience API returning only generated cases."""
    return list(generate_synthetic_dataset(count=count, seed=seed).cases)
