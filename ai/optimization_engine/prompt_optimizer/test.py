from __future__ import annotations

import unittest
from decimal import Decimal

from .compressor import PromptCompressor
from .optimizer import PromptOptimizer
from .rewriter import PromptRewriter
from .templates import (
    create_default_templates,
    get_template,
)
from .utils import (
    calculate_reduction_percent,
    calculate_reduction_ratio,
    count_characters,
    count_lines,
    count_words,
    estimate_tokens,
    normalize_prompt,
    normalize_whitespace,
    remove_repeated_blank_lines,
    remove_repeated_spaces,
    split_prompt_lines,
)


class PromptUtilsTests(unittest.TestCase):
    def test_normalize_prompt(self) -> None:
        result = normalize_prompt(
            "  ModelNow   is an AI platform.  "
        )

        self.assertEqual(
            result,
            "ModelNow   is an AI platform.",
        )

    def test_split_prompt_lines(self) -> None:
        result = split_prompt_lines(
            "Task:\n\nModelNow\n\nOptimize cost."
        )

        self.assertEqual(
            result,
            [
                "Task:",
                "ModelNow",
                "Optimize cost.",
            ],
        )

    def test_count_functions(self) -> None:
        prompt = "Explain ModelNow clearly."

        self.assertEqual(
            count_characters(prompt),
            25,
        )

        self.assertEqual(
            count_words(prompt),
            3,
        )

        self.assertEqual(
            count_lines(prompt),
            1,
        )

    def test_estimate_tokens(self) -> None:
        self.assertEqual(
            estimate_tokens("12345678"),
            2,
        )

        self.assertEqual(
            estimate_tokens(""),
            0,
        )

    def test_reduction_ratio(self) -> None:
        self.assertEqual(
            calculate_reduction_ratio(100, 75),
            Decimal("0.25"),
        )

    def test_reduction_percent(self) -> None:
        self.assertEqual(
            calculate_reduction_percent(100, 75),
            Decimal("25"),
        )

    def test_whitespace_helpers(self) -> None:
        self.assertEqual(
            normalize_whitespace(
                "ModelNow   AI\tPlatform"
            ),
            "ModelNow AI Platform",
        )

        self.assertEqual(
            remove_repeated_spaces(
                "ModelNow    AI"
            ),
            "ModelNow AI",
        )

        self.assertEqual(
            remove_repeated_blank_lines(
                "Task:\n\n\n\nContext:"
            ),
            "Task:\n\nContext:",
        )


class PromptTemplateTests(unittest.TestCase):
    def test_default_templates(self) -> None:
        templates = create_default_templates()

        self.assertIn(
            "instruction",
            templates,
        )

        self.assertIn(
            "context",
            templates,
        )

        self.assertIn(
            "structured",
            templates,
        )

    def test_structured_template(self) -> None:
        template = get_template("structured")

        result = template.render(
            "Explain ModelNow.",
            context="AI execution platform.",
            output_format="Five bullet points.",
        )

        self.assertIn(
            "Task:",
            result,
        )

        self.assertIn(
            "Context:",
            result,
        )

        self.assertIn(
            "Output format:",
            result,
        )

        self.assertIn(
            "Explain ModelNow.",
            result,
        )

    def test_unknown_template(self) -> None:
        with self.assertRaises(ValueError):
            get_template("unknown")


class PromptRewriterTests(unittest.TestCase):
    def test_rewrite(self) -> None:
        rewriter = PromptRewriter()

        result = rewriter.rewrite(
            "  explain   ModelNow   clearly  "
        )

        self.assertTrue(result.changed)
        self.assertEqual(
            result.rewritten_prompt,
            "Task:\nexplain ModelNow clearly",
        )

    def test_existing_task_prefix(self) -> None:
        rewriter = PromptRewriter()

        result = rewriter.rewrite(
            "Task:\nExplain ModelNow."
        )

        self.assertEqual(
            result.rewritten_prompt,
            "Task:\nExplain ModelNow.",
        )

    def test_rewrite_with_context(self) -> None:
        rewriter = PromptRewriter()

        result = rewriter.rewrite_with_context(
            "Explain ModelNow.",
            "ModelNow is an AI platform.",
        )

        self.assertIn(
            "Context:",
            result.rewritten_prompt,
        )

        self.assertIn(
            "ModelNow is an AI platform.",
            result.rewritten_prompt,
        )


class PromptCompressorTests(unittest.TestCase):
    def test_compress(self) -> None:
        compressor = PromptCompressor()

        result = compressor.compress(
            "  Explain   ModelNow.  \n\n\n"
            "  Optimize   cost and latency.  "
        )

        self.assertTrue(result.changed)

        self.assertEqual(
            result.compressed_prompt,
            "Explain ModelNow.\nOptimize cost and latency.",
        )

        self.assertEqual(
            result.characters_saved,
            14,
        )

        self.assertEqual(
            result.reduction_percent,
            Decimal(
                "24.13793103448275862068965517"
            ),
        )

    def test_should_compress(self) -> None:
        compressor = PromptCompressor()

        self.assertTrue(
            compressor.should_compress(
                "  ModelNow   AI  ",
                minimum_reduction_percent=5,
            )
        )

    def test_empty_prompt(self) -> None:
        compressor = PromptCompressor()

        result = compressor.compress("")

        self.assertEqual(
            result.compressed_prompt,
            "",
        )

        self.assertFalse(
            result.changed,
        )


class PromptOptimizerTests(unittest.TestCase):
    def test_optimize(self) -> None:
        optimizer = PromptOptimizer()

        result = optimizer.optimize(
            "  Explain   ModelNow   clearly.  "
        )

        self.assertTrue(result.changed)
        self.assertTrue(result.rewritten)

        self.assertEqual(
            result.optimized_prompt,
            "Task:\nExplain ModelNow clearly.",
        )

        self.assertEqual(
            result.characters_saved,
            2,
        )

    def test_optimize_if_beneficial(self) -> None:
        optimizer = PromptOptimizer(
            minimum_reduction_percent=1.0,
        )

        result = optimizer.optimize_if_beneficial(
            "  Explain   ModelNow   clearly.  "
        )

        self.assertTrue(result.changed)
        self.assertGreaterEqual(
            result.reduction_percent,
            Decimal("1"),
        )

    def test_no_beneficial_optimization(self) -> None:
        optimizer = PromptOptimizer(
            minimum_reduction_percent=50.0,
        )

        result = optimizer.optimize_if_beneficial(
            "  Explain   ModelNow   clearly.  "
        )

        self.assertFalse(result.changed)
        self.assertEqual(
            result.optimized_prompt,
            "  Explain   ModelNow   clearly.  ",
        )

        self.assertEqual(
            result.characters_saved,
            0,
        )

    def test_should_optimize(self) -> None:
        optimizer = PromptOptimizer()

        self.assertFalse(
            optimizer.should_optimize(
                "  Explain   ModelNow.  "
            )
        )

    def test_empty_prompt(self) -> None:
        optimizer = PromptOptimizer()

        result = optimizer.optimize("")

        self.assertFalse(result.changed)
        self.assertEqual(
            result.optimized_prompt,
            "",
        )


if __name__ == "__main__":
    unittest.main()

