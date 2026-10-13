"""Unit tests for ModelNow evaluation reports."""
import csv
import json
import tempfile
import unittest
from pathlib import Path
from io import StringIO

from ai.evaluation.reports import (
    build_dashboard_data,
    create_evaluation_report,
    export_csv,
    export_json,
    summarize_evaluation_report,
)


def sample_results():
    return [
        {
            "case_id": "case-1",
            "model_name": "test-slm",
            "quality_score": 0.9,
            "latency_ms": 20,
            "cost_usd": 0.001,
            "metrics": {"exact_match": 1.0},
            "metadata": {"source": "test"},
        },
        {
            "case_id": "case-2",
            "model_name": "test-llm",
            "quality_score": 0.7,
            "latency_ms": 40,
            "cost_usd": 0.003,
            "metrics": {"exact_match": 0.0},
        },
    ]


class EvaluationReportTests(unittest.TestCase):
    def test_create_report(self):
        report = create_evaluation_report(sample_results())
        self.assertEqual(report["status"], "completed")
        self.assertEqual(report["case_count"], 2)
        self.assertEqual(report["model_count"], 2)
        self.assertEqual(report["models"], ["test-llm", "test-slm"])
        self.assertAlmostEqual(report["mean_quality_score"], 0.8)

    def test_empty_report(self):
        report = create_evaluation_report([])
        self.assertEqual(report["case_count"], 0)
        self.assertIsNone(report["mean_quality_score"])

    def test_summary(self):
        report = create_evaluation_report(sample_results())
        summary = summarize_evaluation_report(report)
        self.assertEqual(summary["case_count"], 2)
        self.assertEqual(summary["model_count"], 2)

    def test_invalid_title_rejected(self):
        with self.assertRaises(ValueError):
            create_evaluation_report([], title=" ")

    def test_invalid_results_rejected(self):
        with self.assertRaises(ValueError):
            create_evaluation_report({"not": "an iterable of results"})

    def test_dashboard_data(self):
        report = create_evaluation_report(sample_results())
        dashboard = build_dashboard_data(report)
        self.assertEqual(dashboard["cards"]["case_count"], 2)
        self.assertEqual(len(dashboard["models"]), 2)
        slm = next(row for row in dashboard["models"]
                   if row["model_name"] == "test-slm")
        self.assertAlmostEqual(slm["mean_quality_score"], 0.9)
        self.assertAlmostEqual(slm["mean_latency_ms"], 20)
        self.assertAlmostEqual(slm["total_cost_usd"], 0.001)

    def test_dashboard_missing_metrics(self):
        report = create_evaluation_report([
            {"case_id": "case-1", "model_name": "unknown-metrics"}
        ])
        model = build_dashboard_data(report)["models"][0]
        self.assertIsNone(model["mean_quality_score"])
        self.assertIsNone(model["mean_latency_ms"])
        self.assertIsNone(model["total_cost_usd"])

    def test_json_export_roundtrip(self):
        report = create_evaluation_report(sample_results())
        decoded = json.loads(export_json(report))
        self.assertEqual(decoded["case_count"], 2)
        self.assertEqual(decoded["results"][0]["case_id"], "case-1")

    def test_csv_export(self):
        report = create_evaluation_report(sample_results())
        content = export_csv(report)
        rows = list(csv.DictReader(StringIO(content)))
        self.assertEqual(len(rows), 2)
        self.assertEqual(rows[0]["case_id"], "case-1")
        self.assertEqual(rows[0]["metrics.exact_match"], "1.0")
        self.assertEqual(rows[0]["metadata.source"], "test")

    def test_export_to_files(self):
        report = create_evaluation_report(sample_results())
        with tempfile.TemporaryDirectory() as folder:
            json_path = Path(folder) / "nested" / "report.json"
            csv_path = Path(folder) / "nested" / "report.csv"

            export_json(report, json_path)
            export_csv(report, csv_path)

            self.assertTrue(json_path.is_file())
            self.assertTrue(csv_path.is_file())
            self.assertEqual(json.loads(json_path.read_text(
                encoding="utf-8"
            ))["case_count"], 2)
            self.assertIn("case_id", csv_path.read_text(encoding="utf-8"))

    def test_invalid_export_input(self):
        with self.assertRaises(ValueError):
            export_json({"results": "not-a-list"})
        with self.assertRaises(ValueError):
            export_csv({"results": "not-a-list"})


if __name__ == "__main__":
    unittest.main(verbosity=2)
