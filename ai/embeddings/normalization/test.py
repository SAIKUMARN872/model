import math
import unittest

from ai.embeddings.normalization import (
    PreprocessingConfig,
    TextPreprocessor,
    clean_text,
    clean_texts,
    l1_normalize,
    l2_normalize,
    min_max_scale,
    normalize_vector,
    normalize_vectors,
    preprocess_for_embedding,
    validate_text,
    validate_text_batch,
    validate_vector_dimensions,
)


class NormalizationTests(unittest.TestCase):
    def test_clean_whitespace(self):
        self.assertEqual(clean_text("  hello \n world\t "), "hello world")

    def test_unicode_normalization(self):
        self.assertEqual(clean_text("cafe\u0301"), "café")

    def test_control_characters_removed(self):
        self.assertEqual(clean_text("a\x00b"), "ab")

    def test_clean_text_type(self):
        with self.assertRaises(TypeError):
            clean_text(123)

    def test_clean_texts(self):
        self.assertEqual(clean_texts([" a ", "b  c"]), ["a", "b c"])

    def test_l2_normalization(self):
        vector = l2_normalize([3.0, 4.0])
        self.assertAlmostEqual(math.sqrt(sum(x * x for x in vector)), 1.0)

    def test_l1_normalization(self):
        self.assertEqual(l1_normalize([1.0, -1.0]), [0.5, -0.5])

    def test_normalize_dispatch(self):
        self.assertEqual(normalize_vector([3.0, 4.0], norm="l1"), [0.42857142857142855, 0.5714285714285714])

    def test_normalize_many(self):
        result = normalize_vectors([[3.0, 4.0], [0.0, 2.0]])
        self.assertEqual(len(result), 2)
        self.assertAlmostEqual(result[0][0], 0.6)

    def test_zero_vector_rejected(self):
        with self.assertRaises(ValueError):
            l2_normalize([0.0, 0.0])

    def test_invalid_vector_number(self):
        with self.assertRaises(TypeError):
            l2_normalize([1.0, "bad"])

    def test_non_finite_vector_rejected(self):
        with self.assertRaises(ValueError):
            l2_normalize([float("inf")])

    def test_min_max_scale(self):
        self.assertEqual(min_max_scale([2.0, 4.0, 6.0]), [0.0, 0.5, 1.0])

    def test_min_max_constant(self):
        self.assertEqual(min_max_scale([5.0, 5.0]), [0.0, 0.0])

    def test_preprocessor(self):
        processor = TextPreprocessor(PreprocessingConfig(lowercase=True))
        self.assertEqual(processor.process("  Hello   WORLD "), "hello world")

    def test_preprocessor_max_length(self):
        processor = TextPreprocessor(
            PreprocessingConfig(min_characters=1, max_characters=4)
        )
        self.assertEqual(processor.process("abcdefgh"), "abcd")

    def test_preprocessor_min_length(self):
        processor = TextPreprocessor(PreprocessingConfig(min_characters=3))
        with self.assertRaises(ValueError):
            processor.process(" a ")

    def test_invalid_preprocessor_config(self):
        with self.assertRaises(ValueError):
            TextPreprocessor(PreprocessingConfig(min_characters=-1))

    def test_process_many(self):
        processor = TextPreprocessor()
        self.assertEqual(processor.process_many([" one ", "two"]), ["one", "two"])

    def test_validate_text(self):
        self.assertEqual(validate_text(" hello "), " hello ")

    def test_validate_empty_text(self):
        with self.assertRaises(ValueError):
            validate_text(" ")

    def test_validate_text_batch(self):
        self.assertEqual(validate_text_batch(["a", "b"]), ["a", "b"])

    def test_empty_batch_option(self):
        with self.assertRaises(ValueError):
            validate_text_batch([], allow_empty_batch=False)

    def test_vector_dimensions(self):
        self.assertEqual(validate_vector_dimensions([[1.0, 2.0], [3.0, 4.0]]), 2)

    def test_inconsistent_dimensions(self):
        with self.assertRaises(ValueError):
            validate_vector_dimensions([[1.0, 2.0], [3.0]])

    def test_preprocess_for_embedding(self):
        self.assertEqual(preprocess_for_embedding([" Hello "], lowercase=True), ["hello"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
