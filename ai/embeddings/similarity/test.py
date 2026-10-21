from __future__ import annotations

import math
import unittest

from ai.embeddings.similarity import (
    cosine_similarity,
    dot_product,
    euclidean_distance,
)


class SimilarityTests(unittest.TestCase):
    def test_cosine_identical_vectors(self):
        self.assertAlmostEqual(cosine_similarity([1, 2], [1, 2]), 1.0)

    def test_cosine_orthogonal_vectors(self):
        self.assertAlmostEqual(cosine_similarity([1, 0], [0, 1]), 0.0)

    def test_cosine_opposite_vectors(self):
        self.assertAlmostEqual(cosine_similarity([1, 0], [-1, 0]), -1.0)

    def test_cosine_zero_vector_rejected(self):
        with self.assertRaises(ValueError):
            cosine_similarity([0, 0], [1, 2])

    def test_dot_product(self):
        self.assertEqual(dot_product([1, 2, 3], [4, 5, 6]), 32)

    def test_dot_product_negative(self):
        self.assertEqual(dot_product([1, -2], [3, 4]), -5)

    def test_euclidean_distance(self):
        self.assertAlmostEqual(euclidean_distance([0, 0], [3, 4]), 5.0)

    def test_euclidean_identical_vectors(self):
        self.assertEqual(euclidean_distance([1, 2], [1, 2]), 0.0)

    def test_dimension_mismatch(self):
        for function in (cosine_similarity, dot_product, euclidean_distance):
            with self.subTest(function=function.__name__):
                with self.assertRaises(ValueError):
                    function([1, 2], [1])

    def test_empty_vector(self):
        with self.assertRaises(ValueError):
            dot_product([], [])

    def test_non_finite_values(self):
        with self.assertRaises(ValueError):
            dot_product([math.inf], [1])

    def test_invalid_type(self):
        with self.assertRaises(TypeError):
            dot_product([1, "x"], [1, 2])

    def test_boolean_rejected(self):
        with self.assertRaises(TypeError):
            dot_product([True], [1])


if __name__ == "__main__":
    unittest.main()
