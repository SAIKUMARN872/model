import unittest

from ai.rag.query_rewriter import (
    QueryExpander,
    QueryNormalizer,
    QueryRewriter,
    expand_query,
    normalize_query,
    rewrite_query,
    unique_queries,
    validate_query,
)


class QueryRewriterTests(unittest.TestCase):
    def test_normalize_whitespace(self):
        self.assertEqual(
            normalize_query("  How   does   RAG work?  "),
            "How does RAG work?",
        )

    def test_normalizer_class(self):
        self.assertEqual(
            QueryNormalizer().normalize("  hello   world "),
            "hello world",
        )

    def test_reject_empty_query(self):
        with self.assertRaises(ValueError):
            normalize_query("   ")

    def test_reject_non_string_query(self):
        with self.assertRaises(TypeError):
            validate_query(123)

    def test_expansion_preserves_original_first(self):
        queries = expand_query("How does RAG work?")
        self.assertEqual(queries[0], "How does RAG work?")
        self.assertIn(
            "How does RAG work? (retrieval augmented generation)",
            queries,
        )

    def test_expansion_without_known_term(self):
        self.assertEqual(expand_query("Explain databases"), ["Explain databases"])

    def test_max_queries(self):
        queries = expand_query("Explain RAG and LLM", max_queries=2)
        self.assertEqual(len(queries), 2)
        self.assertEqual(queries[0], "Explain RAG and LLM")

    def test_invalid_max_queries(self):
        with self.assertRaises(ValueError):
            expand_query("RAG", max_queries=0)

    def test_invalid_max_queries_type(self):
        with self.assertRaises(TypeError):
            expand_query("RAG", max_queries=1.5)

    def test_unique_queries_preserves_order(self):
        self.assertEqual(
            unique_queries(["RAG", " rag ", "LLM", "", "LLM"]),
            ["RAG", "LLM"],
        )

    def test_unique_queries_rejects_string_argument(self):
        with self.assertRaises(TypeError):
            unique_queries("RAG")

    def test_rewriter_returns_normalized_query(self):
        result = rewrite_query("  How   does RAG work?  ")
        self.assertEqual(result.normalized_query, "How does RAG work?")
        self.assertEqual(result.queries[0], "How does RAG work?")

    def test_rewriter_can_disable_expansion(self):
        result = rewrite_query("  How   does RAG work?  ", expand=False)
        self.assertEqual(result.queries, ("How does RAG work?",))
        self.assertEqual(result.expanded_queries, ())

    def test_rewriter_preserves_original_input(self):
        original = "  How   does RAG work?  "
        result = rewrite_query(original)
        self.assertEqual(result.original_query, original)

    def test_rewriter_class(self):
        result = QueryRewriter().rewrite("Explain RAG")
        self.assertEqual(result.normalized_query, "Explain RAG")
        self.assertEqual(result.queries[0], "Explain RAG")

    def test_expander_class(self):
        result = QueryExpander().expand("Explain RAG")
        self.assertEqual(result[0], "Explain RAG")

    def test_callable_rewriter(self):
        result = QueryRewriter()("Explain RAG")
        self.assertEqual(result.normalized_query, "Explain RAG")

    def test_callable_normalizer(self):
        self.assertEqual(QueryNormalizer()("  hello   world "), "hello world")


if __name__ == "__main__":
    unittest.main(verbosity=2)
