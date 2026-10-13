"""Real-operation checks for ModelNow evaluation core."""
import sys
from ai.evaluation import EvaluationCase, EvaluationEngine, EvaluationValidationError


def main():
    engine = EvaluationEngine()
    checks = []

    def check(name, operation):
        try:
            operation()
            checks.append((name, True, ""))
        except Exception as exc:
            checks.append((name, False, f"{type(exc).__name__}: {exc}"))

    def perfect_answer():
        result = engine.evaluate(
            EvaluationCase("real-1", "slm-test", "ModelNow routes AI", "ModelNow routes AI")
        )
        assert result.quality_score == 1.0
        assert result.metrics["exact_match"] is True

    def partial_answer():
        result = engine.evaluate(
            EvaluationCase("real-2", "llm-test", "red blue", "red green")
        )
        assert abs(result.metrics["token_f1"] - 0.5) < 1e-9

    def token_accounting():
        result = engine.evaluate(
            EvaluationCase(
                "real-3", "slm-test", "answer",
                input_tokens=25, output_tokens=15,
                latency_ms=42, cost_usd=0.002,
            )
        )
        assert result.metrics["total_tokens"] == 40
        assert result.metrics["latency_ms"] == 42
        assert result.metrics["cost_usd"] == 0.002

    def batch_and_summary():
        results = engine.evaluate_batch([
            EvaluationCase("real-4", "model-b", "yes", "yes", latency_ms=10, cost_usd=0.01),
            EvaluationCase("real-5", "model-a", "no", "yes", latency_ms=30, cost_usd=0.02),
        ])
        summaries = engine.summarize(results)
        assert len(summaries) == 2
        assert [item.model_name for item in summaries] == ["model-a", "model-b"]
        assert summaries[1].case_count == 1
        assert summaries[1].mean_quality_score == 1.0

    def invalid_input_rejected():
        try:
            engine.evaluate(EvaluationCase("real-6", "model", "answer", latency_ms=-1))
        except EvaluationValidationError:
            return
        raise AssertionError("Negative latency was not rejected")

    def empty_batch_supported():
        assert engine.evaluate_batch([]) == []
        assert engine.summarize([]) == []

    check("Perfect answer quality", perfect_answer)
    check("Partial token F1", partial_answer)
    check("Token and performance accounting", token_accounting)
    check("Batch evaluation and model summary", batch_and_summary)
    check("Invalid input rejection", invalid_input_rejected)
    check("Empty batch and summary", empty_batch_supported)

    print("=" * 72)
    print("MODELNOW EVALUATION REAL-OPERATION TESTS")
    print("=" * 72)
    for name, passed, error in checks:
        print(f"{'PASS' if passed else 'FAIL'}: {name}")
        if error:
            print(f"  {error}")

    failures = sum(not passed for _, passed, _ in checks)
    print("-" * 72)
    print(f"RESULT: {len(checks) - failures}/{len(checks)} checks passed")
    if failures:
        sys.exit(1)
    print("MODELNOW EVALUATION REAL-OPERATION PASS")


if __name__ == "__main__":
    main()
