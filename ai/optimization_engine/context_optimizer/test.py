from __future__ import annotations

import unittest
from decimal import Decimal

from .compressor import ContextCompressor
from .manager import ContextManager
from .optimizer import ContextOptimizer
from .summarizer import ContextSummarizer
from .utils import (
    calculate_reduction_percent,
    calculate_reduction_ratio,
    deduplicate_lines,
    estimate_tokens,
    normalize_context,
)
from .window import ContextWindow


class ContextUtilsTests(unittest.TestCase):

    def test_normalize_context(self) -> None:
        result = normalize_context(" ModelNow  \r\n AI Platform ")
        self.assertEqual(result, "ModelNow\n AI Platform")

    def test_deduplicate_lines(self) -> None:
        result = deduplicate_lines(["A", "B", "A", "C", "B"])
        self.assertEqual(result, ["A", "B", "C"])

    def test_estimate_tokens(self) -> None:
        result = estimate_tokens("ModelNow AI Platform")
        self.assertEqual(result, 5)

    def test_reduction_ratio(self) -> None:
        result = calculate_reduction_ratio(100, 75)
        self.assertEqual(result, Decimal("0.25"))

    def test_reduction_percent(self) -> None:
        result = calculate_reduction_percent(100, 75)
        self.assertEqual(result, Decimal("25"))


class ContextCompressorTests(unittest.TestCase):

    def test_compress_duplicate_lines(self) -> None:
        compressor = ContextCompressor()

        result = compressor.compress(
            "ModelNow is an AI platform.\n"
            "ModelNow is an AI platform.\n"
            "ModelNow optimizes models."
        )

        self.assertTrue(result.changed)
        self.assertEqual(result.compressed_characters, 54)
        self.assertEqual(result.characters_saved, 28)

    def test_should_compress(self) -> None:
        compressor = ContextCompressor()

        context = (
            "ModelNow is an AI platform.\n"
            "ModelNow is an AI platform.\n"
            "ModelNow optimizes models."
        )

        self.assertTrue(
            compressor.should_compress(
                context,
                minimum_reduction_percent=5,
            )
        )

    def test_empty_context(self) -> None:
        compressor = ContextCompressor()
        result = compressor.compress("")

        self.assertFalse(result.changed)
        self.assertEqual(result.characters_saved, 0)


class ContextSummarizerTests(unittest.TestCase):

    def test_summarize_duplicates(self) -> None:
        summarizer = ContextSummarizer()

        result = summarizer.summarize(
            "A\nA\nB\nC",
            max_characters=100,
        )

        self.assertEqual(result.summary, "A\nB\nC")
        self.assertTrue(result.changed)

    def test_character_budget(self) -> None:
        summarizer = ContextSummarizer()

        result = summarizer.summarize(
            "First context line\nSecond context line\nThird context line",
            max_characters=25,
        )

        self.assertLessEqual(result.summary_characters, 25)

    def test_should_summarize(self) -> None:
        summarizer = ContextSummarizer()

        self.assertTrue(
            summarizer.should_summarize(
                "A" * 100,
                max_characters=50,
            )
        )

        self.assertFalse(
            summarizer.should_summarize(
                "A" * 20,
                max_characters=50,
            )
        )


class ContextWindowTests(unittest.TestCase):

    def test_character_window(self) -> None:
        window = ContextWindow(max_characters=40)

        result = window.fit(
            "Old context.\n"
            "ModelNow is an AI platform.\n"
            "Latest request."
        )

        self.assertEqual(result.windowed_characters, 40)
        self.assertTrue(result.truncated)

    def test_within_window(self) -> None:
        window = ContextWindow(max_characters=50)

        self.assertTrue(
            window.within_window("ModelNow AI")
        )

        self.assertFalse(
            window.within_window("A" * 100)
        )

    def test_token_window(self) -> None:
        window = ContextWindow(
            max_tokens=5,
            characters_per_token=4,
        )

        result = window.fit("ModelNow is an AI platform")

        self.assertLessEqual(result.windowed_tokens, 5)
        self.assertTrue(result.truncated)


class ContextManagerTests(unittest.TestCase):

    def test_manager_compression(self) -> None:
        manager = ContextManager()

        result = manager.optimize(
            "A\nA\nB",
        )

        self.assertTrue(result.compressed)
        self.assertTrue(result.changed)

    def test_manager_window(self) -> None:
        manager = ContextManager()

        result = manager.optimize(
            "A" * 100,
            max_characters=30,
        )

        self.assertTrue(result.windowed)
        self.assertEqual(result.optimized_characters, 30)

    def test_manager_summary(self) -> None:
        manager = ContextManager()

        result = manager.optimize(
            "A\nB\nC\nD\nE",
            summary_threshold=5,
        )

        self.assertTrue(result.summarized)


class ContextOptimizerTests(unittest.TestCase):

    def test_optimize(self) -> None:
        optimizer = ContextOptimizer()

        result = optimizer.optimize(
            "ModelNow is an AI platform.\n"
            "ModelNow is an AI platform.\n"
            "ModelNow optimizes models."
        )

        self.assertTrue(result.changed)
        self.assertGreater(result.characters_saved, 0)

    def test_optimize_with_window(self) -> None:
        optimizer = ContextOptimizer()

        result = optimizer.optimize(
            "A" * 100,
            max_characters=50,
        )

        self.assertEqual(result.optimized_characters, 50)
        self.assertTrue(result.changed)

    def test_optimize_if_beneficial(self) -> None:
        optimizer = ContextOptimizer(
            minimum_reduction_percent=10,
        )

        result = optimizer.optimize_if_beneficial(
            "A\nA\nB\nC\nD",
        )

        self.assertTrue(result.changed)
        self.assertGreaterEqual(
            result.reduction_percent,
            Decimal("10"),
        )

    def test_no_beneficial_optimization(self) -> None:
        optimizer = ContextOptimizer(
            minimum_reduction_percent=50,
        )

        result = optimizer.optimize_if_beneficial(
            "ModelNow AI platform.",
        )

        self.assertFalse(result.changed)
        self.assertEqual(result.characters_saved, 0)

    def test_should_optimize(self) -> None:
        optimizer = ContextOptimizer()

        self.assertTrue(
            optimizer.should_optimize(
                "A" * 100,
                max_characters=50,
            )
        )


if __name__ == "__main__":
    unittest.main()
