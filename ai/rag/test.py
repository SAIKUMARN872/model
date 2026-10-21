"""Tests for the ModelNow RAG foundation."""

import math
import unittest

from ai.rag.exceptions import RAGValidationError
from ai.rag.models import RAGDocument, RAGRequest
from ai.rag.utils import (
    metadata_matches,
    normalize_text,
    stable_hash,
    validate_query,
    validate_score,
    validate_top_k,
)


class RAGFoundationTests(unittest.TestCase):
    def test_normalize_text(self):
        self.assertEqual(normalize_text("  hello \n world  "), "hello world")

    def test_validate_query(self):
        self.assertEqual(validate_query("  explain RAG  "), "explain RAG")

    def test_reject_empty_query(self):
        with self.assertRaises(RAGValidationError):
            validate_query("   ")

    def test_validate_top_k(self):
        self.assertEqual(validate_top_k(5), 5)
        with self.assertRaises(RAGValidationError):
            validate_top_k(0)

    def test_reject_boolean_top_k(self):
        with self.assertRaises(RAGValidationError):
            validate_top_k(True)

    def test_validate_score(self):
        self.assertEqual(validate_score(0.75), 0.75)

    def test_reject_nonfinite_score(self):
        with self.assertRaises(RAGValidationError):
            validate_score(math.inf)

    def test_metadata_matching(self):
        self.assertTrue(metadata_matches({"team": "AI"}, {"team": "AI"}))
        self.assertFalse(metadata_matches({"team": "AI"}, {"team": "HR"}))

    def test_stable_hash(self):
        self.assertEqual(
            stable_hash({"a": 1, "b": 2}),
            stable_hash({"b": 2, "a": 1}),
        )

    def test_existing_rag_models(self):
        document = RAGDocument(document_id="doc-1", text="RAG content")
        request = RAGRequest(query="Explain RAG")
        self.assertEqual(document.document_id, "doc-1")
        self.assertEqual(request.top_k, 5)


if __name__ == "__main__":
    unittest.main(verbosity=2)
