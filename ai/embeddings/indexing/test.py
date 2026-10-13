"""Offline tests for the embedding indexing components."""

import math
import unittest

from .builder import EmbeddingIndexBuilder
from .manager import EmbeddingIndexManager
from .optimizer import EmbeddingIndexOptimizer
from .utils import validate_ids, validate_metadata, validate_vectors


class FakeIndexBackend:
    def __init__(self):
        self.records = {}
        self.closed = False

    def add_vectors(self, ids, vectors, metadata=None):
        for index, record_id in enumerate(ids):
            self.records[record_id] = {
                "vector": list(vectors[index]),
                "metadata": dict(metadata[index]),
            }
        return {"inserted": len(ids)}

    def delete(self, ids):
        deleted = 0
        for record_id in ids:
            if record_id in self.records:
                del self.records[record_id]
                deleted += 1
        return {"deleted": deleted}

    def search(self, vector, limit=10, filters=None):
        query_norm = math.sqrt(sum(value * value for value in vector))
        results = []
        for record_id, record in self.records.items():
            metadata = record["metadata"]
            if filters and any(metadata.get(k) != v for k, v in filters.items()):
                continue
            candidate = record["vector"]
            candidate_norm = math.sqrt(sum(value * value for value in candidate))
            score = sum(a * b for a, b in zip(vector, candidate))
            if query_norm and candidate_norm:
                score /= query_norm * candidate_norm
            results.append({"id": record_id, "score": score, "metadata": metadata})
        return sorted(results, key=lambda item: item["score"], reverse=True)[:limit]

    def close(self):
        self.closed = True


class IndexingTests(unittest.TestCase):
    def setUp(self):
        self.backend = FakeIndexBackend()
        self.manager = EmbeddingIndexManager(self.backend)

    def test_vector_validation(self):
        self.assertEqual(validate_vectors([[1, 2], [3, 4]]), [[1.0, 2.0], [3.0, 4.0]])

    def test_mismatched_dimensions_rejected(self):
        with self.assertRaises(ValueError):
            validate_vectors([[1, 2], [3]])

    def test_non_finite_rejected(self):
        with self.assertRaises(ValueError):
            validate_vectors([[float("inf")]])

    def test_ids_unique(self):
        with self.assertRaises(ValueError):
            validate_ids(["same", "same"], 2)

    def test_ids_count(self):
        with self.assertRaises(ValueError):
            validate_ids(["one"], 2)

    def test_metadata_count(self):
        with self.assertRaises(ValueError):
            validate_metadata([{}], 2)

    def test_build(self):
        result = EmbeddingIndexBuilder(self.backend).build(
            ["a", "b"], [[1, 0], [0, 1]], [{"group": "x"}, {"group": "y"}]
        )
        self.assertEqual(result["count"], 2)
        self.assertEqual(result["dimension"], 2)
        self.assertEqual(len(self.backend.records), 2)

    def test_manager_add(self):
        result = self.manager.add(["a"], [[1, 2]])
        self.assertEqual(result["count"], 1)

    def test_search(self):
        self.manager.add(["a", "b"], [[1, 0], [0, 1]])
        result = self.manager.search([1, 0], limit=1)
        self.assertEqual(result[0]["id"], "a")

    def test_metadata_filter(self):
        self.manager.add(["a", "b"], [[1, 0], [0, 1]], [{"kind": "x"}, {"kind": "y"}])
        result = self.manager.search([0, 1], filters={"kind": "x"})
        self.assertEqual([item["id"] for item in result], ["a"])

    def test_delete(self):
        self.manager.add(["a"], [[1, 0]])
        result = self.manager.delete(["a"])
        self.assertEqual(result["deleted"], 1)
        self.assertNotIn("a", self.backend.records)

    def test_normalize_vectors(self):
        vectors = EmbeddingIndexOptimizer.normalize_vectors([[3, 4]])
        self.assertAlmostEqual(vectors[0][0], 0.6)
        self.assertAlmostEqual(vectors[0][1], 0.8)

    def test_zero_vector_rejected(self):
        with self.assertRaises(ValueError):
            EmbeddingIndexOptimizer.normalize_vectors([[0, 0]])

    def test_batch_indices(self):
        self.assertEqual(
            EmbeddingIndexOptimizer.batch_indices(5, 2),
            [(0, 2), (2, 4), (4, 5)],
        )

    def test_memory_estimate(self):
        self.assertEqual(EmbeddingIndexOptimizer.estimate_memory_bytes(10, 4), 160)

    def test_empty_build(self):
        result = self.manager.build([], [])
        self.assertEqual(result["count"], 0)

    def test_close(self):
        self.manager.close()
        self.assertTrue(self.backend.closed)


if __name__ == "__main__":
    unittest.main()
