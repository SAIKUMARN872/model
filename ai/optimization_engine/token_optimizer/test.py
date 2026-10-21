import unittest

from .compressor import create_default_compressor
from .counter import create_default_counter
from .optimizer import create_default_token_optimizer
from .reducer import create_default_reducer
from .tokenizer import (
    CharacterRatioTokenizer,
    ModelTokenizer,
    create_default_tokenizer,
)
from .utils import (
    calculate_reduction,
    calculate_reduction_percent,
    estimate_tokens_from_characters,
    normalize_text,
)


class TokenUtilsTests(unittest.TestCase):

    def test_normalize_text(self):
        self.assertEqual(
            normalize_text("  ModelNow   AI   platform  "),
            "ModelNow AI platform",
        )

    def test_reduction(self):
        self.assertEqual(calculate_reduction(100, 70), 30)

    def test_reduction_percent(self):
        self.assertEqual(
            calculate_reduction_percent(100, 75),
            25,
        )

    def test_character_estimation(self):
        self.assertEqual(
            estimate_tokens_from_characters(16, 4),
            4,
        )


class TokenizerTests(unittest.TestCase):

    def test_default_tokenizer(self):
        tokenizer = create_default_tokenizer()

        self.assertEqual(
            tokenizer.count("ModelNow optimizes AI."),
            4,
        )

    def test_empty_text(self):
        tokenizer = create_default_tokenizer()

        self.assertEqual(
            tokenizer.count(""),
            0,
        )

    def test_character_ratio_tokenizer(self):
        tokenizer = CharacterRatioTokenizer(4)

        self.assertEqual(
            tokenizer.count("12345678"),
            2,
        )

    def test_model_tokenizer(self):
        tokenizer = ModelTokenizer(lambda text: 7)

        self.assertEqual(
            tokenizer.count("ModelNow"),
            7,
        )


class TokenCounterTests(unittest.TestCase):

    def test_count(self):
        counter = create_default_counter()

        self.assertEqual(
            counter.count("ModelNow optimizes AI."),
            4,
        )

    def test_compare(self):
        counter = create_default_counter()

        result = counter.compare(
            "ModelNow optimizes enterprise AI.",
            "ModelNow optimizes AI.",
        )

        self.assertGreater(result.tokens_saved, 0)
        self.assertGreater(result.reduction_percent, 0)


class TokenReducerTests(unittest.TestCase):

    def test_reduce_whitespace(self):
        reducer = create_default_reducer()

        result = reducer.reduce(
            "ModelNow    is an AI platform."
        )

        self.assertTrue(result.characters_saved > 0)
        self.assertEqual(
            result.optimized_text,
            "ModelNow is an AI platform.",
        )

    def test_duplicate_blank_lines(self):
        reducer = create_default_reducer()

        result = reducer.reduce(
            "ModelNow.\n\n\n\nAI platform."
        )

        self.assertEqual(
            result.optimized_text,
            "ModelNow.\n\nAI platform.",
        )


class CompressorTests(unittest.TestCase):

    def test_duplicate_lines(self):
        compressor = create_default_compressor()

        result = compressor.compress(
            "ModelNow AI.\nModelNow AI.\nModelNow platform."
        )

        self.assertTrue(result.characters_saved > 0)
        self.assertNotIn(
            "ModelNow AI.\nModelNow AI.",
            result.compressed_text,
        )

    def test_should_compress(self):
        compressor = create_default_compressor()

        self.assertTrue(
            compressor.should_compress(
                "ModelNow    AI platform.",
                minimum_savings=1,
            )
        )


class TokenOptimizerTests(unittest.TestCase):

    def setUp(self):
        self.optimizer = create_default_token_optimizer()

    def test_optimize(self):
        result = self.optimizer.optimize(
            "ModelNow    is an AI platform.\n"
            "ModelNow    is an AI platform.\n\n\n"
            "ModelNow optimizes models."
        )

        self.assertTrue(result.changed)
        self.assertGreater(result.tokens_saved, 0)
        self.assertGreater(result.reduction_percent, 0)
        self.assertLess(
            result.optimized_tokens,
            result.original_tokens,
        )

    def test_no_change_needed(self):
        result = self.optimizer.optimize(
            "ModelNow is an AI platform."
        )

        self.assertFalse(result.changed)

    def test_should_not_optimize_whitespace_only_for_token_savings(self):
        text = "ModelNow    is an AI platform."

        self.assertFalse(
            self.optimizer.should_optimize(
                text,
                minimum_token_savings=1,
            )
        )

    def test_optimize_if_beneficial(self):
        text = (
            "ModelNow is an AI platform.\n"
            "ModelNow is an AI platform."
        )

        optimized = self.optimizer.optimize_if_beneficial(
            text,
            minimum_token_savings=1,
        )

        self.assertNotEqual(
            optimized,
            text,
        )

    def test_no_optimization_when_threshold_not_met(self):
        text = "ModelNow is an AI platform."

        optimized = self.optimizer.optimize_if_beneficial(
            text,
            minimum_token_savings=1,
        )

        self.assertEqual(
            optimized,
            text,
        )


if __name__ == "__main__":
    unittest.main()
