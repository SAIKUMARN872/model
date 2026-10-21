"""ModelNow benchmark unit tests."""
import unittest

from ai.evaluation.benchmarks.benchmark import BenchmarkRunner, benchmark_cases
from ai.evaluation.benchmarks.llm_benchmark import benchmark_llm
from ai.evaluation.benchmarks.rag_benchmark import benchmark_rag, evaluate_retrieval
from ai.evaluation.benchmarks.utils import safe_ratio, validate_nonempty_text
from ai.evaluation.models import EvaluationCase


def make_case(
    case_id="case-1",
    model_name="model-a",
    answer="The sky is blue",
    reference_answer="The sky is blue",
    latency_ms=100.0,
    cost_usd=0.002,
    metadata=None,
):
    return EvaluationCase(
        case_id=case_id,
        model_name=model_name,
        answer=answer,
        reference_answer=reference_answer,
        latency_ms=latency_ms,
        cost_usd=cost_usd,
        input_tokens=10,
        output_tokens=5,
        metadata=metadata or {},
    )


class BenchmarkTests(unittest.TestCase):
    def test_aggregates_quality_latency_and_cost(self):
        result = benchmark_cases([make_case()])
        self.assertEqual(result["case_count"], 1)
        self.assertEqual(result["metrics"]["exact_match_rate"], 1.0)
        self.assertEqual(result["metrics"]["mean_token_f1"], 1.0)
        self.assertEqual(result["metrics"]["mean_latency_ms"], 100.0)
        self.assertAlmostEqual(result["metrics"]["total_cost_usd"], 0.002)
        self.assertEqual(result["metrics"]["input_tokens"], 10)

    def test_groups_by_model(self):
        result = benchmark_cases([
            make_case(model_name="model-a"),
            make_case(case_id="case-2", model_name="model-b"),
        ])
        self.assertEqual(result["model_count"], 2)
        self.assertIn("model-a", result["models"])
        self.assertIn("model-b", result["models"])

    def test_optional_duration_reports_throughput(self):
        result = benchmark_cases([make_case(), make_case(case_id="case-2")], 2)
        self.assertEqual(result["metrics"]["throughput_requests_per_second"], 1.0)

    def test_missing_measurements_stay_none(self):
        result = benchmark_cases([
            make_case(latency_ms=None, cost_usd=None, reference_answer=None)
        ])
        metrics = result["metrics"]
        self.assertIsNone(metrics["mean_latency_ms"])
        self.assertIsNone(metrics["total_cost_usd"])
        self.assertIsNone(metrics["mean_token_f1"])

    def test_empty_cases_rejected(self):
        with self.assertRaises(ValueError):
            benchmark_cases([])

    def test_invalid_case_rejected(self):
        with self.assertRaises(ValueError):
            benchmark_cases(["not a case"])

    def test_invalid_duration_rejected(self):
        with self.assertRaises(ValueError):
            benchmark_cases([make_case()], 0)

    def test_runner(self):
        result = BenchmarkRunner().run([make_case()])
        self.assertEqual(result["case_count"], 1)

    def test_llm_benchmark(self):
        result = benchmark_llm([make_case()])
        self.assertEqual(result["benchmark"], "llm")

    def test_llm_rejects_invalid_input(self):
        with self.assertRaises(ValueError):
            benchmark_llm("not a list")

    def test_retrieval_perfect(self):
        result = evaluate_retrieval(["doc-a", "doc-b"], ["doc-a", "doc-b"])
        self.assertEqual(result["precision_at_k"], 1.0)
        self.assertEqual(result["recall_at_k"], 1.0)
        self.assertEqual(result["reciprocal_rank"], 1.0)

    def test_retrieval_misses(self):
        result = evaluate_retrieval(["doc-x", "doc-y"], ["doc-a"])
        self.assertEqual(result["precision_at_k"], 0.0)
        self.assertEqual(result["recall_at_k"], 0.0)
        self.assertEqual(result["reciprocal_rank"], 0.0)

    def test_empty_retrieval(self):
        result = evaluate_retrieval([], ["doc-a"])
        self.assertEqual(result["precision_at_k"], 0.0)
        self.assertEqual(result["recall_at_k"], 0.0)

    def test_retrieval_requires_relevant_documents(self):
        with self.assertRaises(ValueError):
            evaluate_retrieval(["doc-a"], [])

    def test_duplicate_retrieved_ids_rejected(self):
        with self.assertRaises(ValueError):
            evaluate_retrieval(["doc-a", "doc-a"], ["doc-a"])

    def test_rag_combines_answer_and_retrieval_metrics(self):
        case = make_case(metadata={
            "retrieved_documents": ["doc-a", "doc-b"],
            "relevant_documents": ["doc-b"],
        })
        result = benchmark_rag([case])
        self.assertEqual(result["benchmark"], "rag")
        self.assertEqual(result["answer_metrics"]["exact_match_rate"], 1.0)
        self.assertEqual(result["retrieval_metrics"]["mean_precision_at_k"], 0.5)
        self.assertEqual(result["retrieval_metrics"]["mean_recall_at_k"], 1.0)
        self.assertEqual(result["retrieval_metrics"]["mean_reciprocal_rank"], 0.5)

    def test_rag_requires_both_retrieval_fields(self):
        case = make_case(metadata={"retrieved_documents": ["doc-a"]})
        with self.assertRaises(ValueError):
            benchmark_rag([case])

    def test_rag_without_retrieval_metadata(self):
        result = benchmark_rag([make_case()])
        self.assertIsNone(result["retrieval_metrics"])

    def test_rag_rejects_empty_cases(self):
        with self.assertRaises(ValueError):
            benchmark_rag([])

    def test_safe_ratio(self):
        self.assertEqual(safe_ratio(2, 4), 0.5)
        self.assertEqual(safe_ratio(0, 0), 0.0)

    def test_nonempty_text_validation(self):
        self.assertEqual(validate_nonempty_text("ok", "value"), "ok")
        with self.assertRaises(ValueError):
            validate_nonempty_text(" ", "value")


if __name__ == "__main__":
    unittest.main(verbosity=2)
