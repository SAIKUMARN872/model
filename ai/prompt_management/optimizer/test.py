from __future__ import annotations

from .optimizer import PromptOptimizer, optimize_prompt
from .rewriter import PromptRewriter
from .token_optimizer import TokenOptimizer
from .utils import (
    estimate_tokens,
    normalize_whitespace,
    reduction_percentage,
    remove_duplicate_lines,
)


def expect_exception(expected_type, operation):
    try:
        operation()
    except expected_type:
        return
    except Exception as exc:
        raise AssertionError(
            f"Expected {expected_type.__name__}, got {type(exc).__name__}"
        ) from exc
    raise AssertionError(f"Expected {expected_type.__name__}, but no error was raised")


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def run_tests() -> tuple[int, int]:
    passed = 0
    failed = 0

    def check(name, operation):
        nonlocal passed, failed
        try:
            operation()
            print(f"PASS: {name}")
            passed += 1
        except Exception as exc:
            print(f"FAIL: {name} -> {type(exc).__name__}: {exc}")
            failed += 1

    optimizer = PromptOptimizer()
    rewriter = PromptRewriter()
    token_optimizer = TokenOptimizer()

    def whitespace_cleanup():
        source = "  Summarize this text.   \n\n\n  Include key points.  "
        result = normalize_whitespace(source)
        expected = "Summarize this text.\n\nInclude key points."
        require(
            result == expected,
            f"Unexpected normalized text: {result!r}",
        )

    check("Normalize trailing whitespace and blank-line runs", whitespace_cleanup)

    check("Preserve meaningful line order", lambda: require(
        normalize_whitespace("First\n\nSecond\nThird")
        == "First\n\nSecond\nThird",
        "Meaningful line order changed",
    ))

    check("Remove exact duplicate non-empty lines", lambda: require(
        remove_duplicate_lines("Rule A\nRule B\nRule A")
        == "Rule A\nRule B",
        "Duplicate line was not removed",
    ))

    check("Keep distinct lines", lambda: require(
        remove_duplicate_lines("Rule A\nRule B") == "Rule A\nRule B",
        "Distinct lines changed",
    ))

    check("Keep case-distinct lines", lambda: require(
        remove_duplicate_lines("Summarize\nsummarize")
        == "Summarize\nsummarize",
        "Case-distinct lines were merged",
    ))

    check("Estimate whitespace-delimited token count", lambda: require(
        estimate_tokens("one two\nthree") == 3,
        "Token estimate mismatch",
    ))

    check("Reject non-string token estimation input", lambda: expect_exception(
        TypeError, lambda: estimate_tokens(42)
    ))

    check("Reject non-string prompts in normalization", lambda: expect_exception(
        TypeError, lambda: normalize_whitespace(42)
    ))

    check("Reject empty prompts", lambda: expect_exception(
        ValueError, lambda: optimizer.optimize("   ")
    ))

    check("Reject non-string prompts", lambda: expect_exception(
        TypeError, lambda: optimizer.optimize(123)
    ))

    def rewrite_reports_transformations():
        source = "  Explain this.  \n\n\nExplain this.\nKeep the example."
        result = rewriter.rewrite(source)
        require(result.original_prompt == source, "Original prompt not retained")
        require(
            result.rewritten_prompt == "Explain this.\nKeep the example.",
            f"Unexpected rewrite: {result.rewritten_prompt!r}",
        )
        require(bool(result.transformations), "Transformations not reported")

    check("Rewrite prompt and report transformations", rewrite_reports_transformations)

    check("Return unchanged clean prompts", lambda: require(
        rewriter.rewrite("Explain the result.\nShow one example.")
        .rewritten_prompt == "Explain the result.\nShow one example.",
        "Clean prompt changed",
    ))

    def optimization_reports_counts():
        source = "Explain Python\nShow examples\nExplain Python"
        result = token_optimizer.optimize(source)
        require(result.optimized_prompt == "Explain Python\nShow examples",
                "Unexpected optimized prompt")
        require(result.estimated_tokens_before == 6,
                "Before estimate mismatch")
        require(result.estimated_tokens_after == 4,
                "After estimate mismatch")
        require(result.estimated_tokens_saved == 2, "Saved estimate mismatch")
        require(result.reduction_percent == 33.33, "Reduction percentage mismatch")

    check("Calculate token estimates and reduction", optimization_reports_counts)

    check("Never report negative token savings", lambda: require(
        token_optimizer.optimize("Keep this prompt")
        .estimated_tokens_saved >= 0,
        "Negative savings reported",
    ))

    check("Keep the original prompt in optimization results", lambda: require(
        optimizer.optimize("Keep original").original_prompt == "Keep original",
        "Original prompt was not retained",
    ))

    check("Provide optimized text convenience method", lambda: require(
        optimizer.optimize_text("  Clean this.  ")
        == "Clean this.",
        "Convenience method returned unexpected text",
    ))

    check("Provide module-level optimization function", lambda: require(
        optimize_prompt("  Use clear steps.  ").optimized_prompt
        == "Use clear steps.",
        "Module-level function failed",
    ))

    check("Expose estimated counts consistently", lambda: (
        lambda result: require(
            result.estimated_tokens_before == estimate_tokens(result.original_prompt)
            and result.estimated_tokens_after == estimate_tokens(result.optimized_prompt),
            "Reported estimates are inconsistent",
        )
    )(optimizer.optimize("A prompt\nA prompt")))

    check("Keep optimization deterministic", lambda: require(
        optimizer.optimize("Rule one\nRule two\nRule one").optimized_prompt
        == optimizer.optimize("Rule one\nRule two\nRule one").optimized_prompt,
        "Repeated optimization produced different output",
    ))

    check("Handle prompts with tabs and repeated spaces", lambda: require(
        optimizer.optimize("  Explain   this.  \nShow\tresults.").optimized_prompt
        == "Explain   this.\nShow\tresults.",
        "Unexpected whitespace transformation",
    ))

    check("Reject invalid reduction counts", lambda: expect_exception(
        ValueError, lambda: reduction_percentage(-1, 0)
    ))

    check("Handle zero baseline in reduction calculation", lambda: require(
        reduction_percentage(0, 0) == 0.0,
        "Zero baseline should return zero percent",
    ))

    total = passed + failed
    print("=" * 68)
    print(f"REAL-OPERATION CHECKS PASSED: {passed}/{total}")
    print(f"REAL-OPERATION CHECKS FAILED: {failed}/{total}")
    print("PROMPT OPTIMIZER REAL-OPERATION TEST: " + ("PASS" if failed == 0 else "FAIL"))
    return passed, failed


if __name__ == "__main__":
    _, failures = run_tests()
    raise SystemExit(1 if failures else 0)


