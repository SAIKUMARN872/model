"""Unit tests for ModelNow evaluation datasets."""
import json
import tempfile
import unittest
from pathlib import Path

from ai.evaluation.exceptions import EvaluationValidationError
from ai.evaluation.datasets import (
    DatasetCase,
    EvaluationDataset,
    generate_cases,
    generate_synthetic_dataset,
    load_dataset,
    save_dataset,
    validate_dataset,
)


class DatasetTests(unittest.TestCase):
    def test_generate_requested_count(self):
        dataset = generate_synthetic_dataset(count=7)
        self.assertEqual(len(dataset.cases), 7)

    def test_generation_is_deterministic(self):
        first = generate_synthetic_dataset(count=10, seed=17)
        second = generate_synthetic_dataset(count=10, seed=17)
        self.assertEqual(first.cases, second.cases)

    def test_different_seed_changes_generated_data(self):
        first = generate_synthetic_dataset(count=10, seed=17)
        second = generate_synthetic_dataset(count=10, seed=18)
        self.assertNotEqual(first.cases, second.cases)

    def test_generated_answers_exist(self):
        dataset = generate_synthetic_dataset(count=12)
        self.assertTrue(all(case.reference_answer is not None for case in dataset.cases))

    def test_generated_ids_are_unique(self):
        dataset = generate_synthetic_dataset(count=100)
        ids = [case.case_id for case in dataset.cases]
        self.assertEqual(len(ids), len(set(ids)))

    def test_generate_cases_returns_list(self):
        cases = generate_cases(count=3)
        self.assertIsInstance(cases, list)
        self.assertEqual(len(cases), 3)

    def test_count_must_be_positive(self):
        for count in (0, -1, True, 1.5):
            with self.subTest(count=count):
                with self.assertRaises(EvaluationValidationError):
                    generate_synthetic_dataset(count=count)

    def test_seed_must_be_integer(self):
        with self.assertRaises(EvaluationValidationError):
            generate_synthetic_dataset(seed=True)

    def test_dataset_name_required(self):
        with self.assertRaises(EvaluationValidationError):
            generate_synthetic_dataset(name="  ")

    def test_case_requires_nonempty_id(self):
        case = DatasetCase(case_id=" ", input_text="hello")
        with self.assertRaises(EvaluationValidationError):
            validate_dataset(EvaluationDataset(name="test", cases=(case,)))

    def test_case_requires_nonempty_input(self):
        case = DatasetCase(case_id="1", input_text=" ")
        with self.assertRaises(EvaluationValidationError):
            validate_dataset(EvaluationDataset(name="test", cases=(case,)))

    def test_duplicate_case_ids_rejected(self):
        case = DatasetCase(case_id="same", input_text="question")
        with self.assertRaisesRegex(EvaluationValidationError, "duplicate"):
            validate_dataset(
                EvaluationDataset(name="test", cases=(case, case))
            )

    def test_empty_dataset_rejected(self):
        with self.assertRaises(EvaluationValidationError):
            validate_dataset(EvaluationDataset(name="empty", cases=()))

    def test_json_round_trip(self):
        dataset = generate_synthetic_dataset(count=4, seed=5)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "dataset.json"
            save_dataset(dataset, path)
            loaded = load_dataset(path)
            self.assertEqual(loaded.name, dataset.name)
            self.assertEqual(loaded.cases, dataset.cases)
            self.assertEqual(loaded.metadata, dataset.metadata)

    def test_jsonl_round_trip_cases(self):
        dataset = generate_synthetic_dataset(count=4, seed=5)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "dataset.jsonl"
            save_dataset(dataset, path)
            loaded = load_dataset(path, name=dataset.name)
            self.assertEqual(loaded.cases, dataset.cases)

    def test_jsonl_skips_blank_lines(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "cases.jsonl"
            record = {"case_id": "1", "input_text": "Question"}
            path.write_text(json.dumps(record) + "\n\n", encoding="utf-8")
            loaded = load_dataset(path)
            self.assertEqual(len(loaded.cases), 1)

    def test_missing_file_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(EvaluationValidationError):
                load_dataset(Path(directory) / "missing.json")

    def test_malformed_json_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.json"
            path.write_text("{invalid", encoding="utf-8")
            with self.assertRaises(EvaluationValidationError):
                load_dataset(path)

    def test_malformed_jsonl_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.jsonl"
            path.write_text('{"case_id":\n', encoding="utf-8")
            with self.assertRaisesRegex(EvaluationValidationError, "line 1"):
                load_dataset(path)

    def test_missing_required_case_field_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.json"
            path.write_text(
                json.dumps({"name": "bad", "cases": [{"case_id": "1"}]}),
                encoding="utf-8",
            )
            with self.assertRaises(EvaluationValidationError):
                load_dataset(path)

    def test_unsupported_extension_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "dataset.txt"
            path.write_text("data", encoding="utf-8")
            with self.assertRaises(EvaluationValidationError):
                load_dataset(path)

    def test_case_metadata_must_be_dict(self):
        case = DatasetCase(
            case_id="1",
            input_text="question",
            metadata=["invalid"],
        )
        with self.assertRaises(EvaluationValidationError):
            validate_dataset(EvaluationDataset(name="test", cases=(case,)))


if __name__ == "__main__":
    unittest.main(verbosity=2)
