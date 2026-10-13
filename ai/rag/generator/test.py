from __future__ import annotations

import asyncio
import unittest

from .generator import RAGGenerator
from .response_builder import build_response
from .streaming import collect_stream, stream_answer
from .utils import (
    build_prompt,
    normalize_answer,
    validate_context,
    validate_query,
)


class GeneratorTests(unittest.TestCase):
    def test_validate_query(self):
        self.assertEqual(validate_query("  Explain RAG  "), "Explain RAG")

    def test_reject_empty_query(self):
        with self.assertRaises(ValueError):
            validate_query("  ")

    def test_reject_non_string_query(self):
        with self.assertRaises(TypeError):
            validate_query(None)

    def test_validate_context(self):
        self.assertEqual(validate_context("  context  "), "context")
        self.assertEqual(validate_context(""), "")

    def test_normalize_answer(self):
        self.assertEqual(normalize_answer("  Generated answer  "), "Generated answer")

    def test_reject_non_string_answer(self):
        with self.assertRaises(TypeError):
            normalize_answer(None)

    def test_build_prompt(self):
        prompt = build_prompt("What is RAG?", "RAG combines retrieval and generation.")
        self.assertIn("What is RAG?", prompt)
        self.assertIn("RAG combines retrieval and generation.", prompt)
        self.assertIn("Do not invent facts.", prompt)

    def test_sync_generation(self):
        def fake_model(query, context, sources):
            return f"Answer: {query}; context={context}; sources={len(sources)}"

        generator = RAGGenerator(fake_model)
        answer = asyncio.run(
            generator.generate("Question?", "Evidence", ["source-1"])
        )

        self.assertEqual(
            answer,
            "Answer: Question?; context=Evidence; sources=1",
        )

    def test_async_generation(self):
        async def fake_model(query, context, sources):
            return "  Async answer  "

        generator = RAGGenerator(fake_model)
        answer = asyncio.run(
            generator.generate("Question?", "Evidence", [])
        )

        self.assertEqual(answer, "Async answer")

    def test_reject_non_callable_generator(self):
        with self.assertRaises(TypeError):
            RAGGenerator("not callable")

    def test_response_builder(self):
        response = build_response(
            query="  Question? ",
            context="Evidence",
            sources=["source-1"],
            answer="  Answer  ",
            metadata={"provider": "test"},
        )

        self.assertEqual(response.query, "Question?")
        self.assertEqual(response.context, "Evidence")
        self.assertEqual(response.sources, ["source-1"])
        self.assertEqual(response.answer, "Answer")
        self.assertEqual(response.metadata["provider"], "test")

    def test_response_builder_without_answer(self):
        response = build_response("Question?", "", [])
        self.assertIsNone(response.answer)
        self.assertEqual(response.metadata, {})

    def test_response_builder_rejects_empty_query(self):
        with self.assertRaises(ValueError):
            build_response(" ", "", [])

    def test_sync_stream(self):
        def fake_stream(query, context, sources):
            return iter(["Hello", " ", "world"])

        chunks = asyncio.run(
            collect_stream(fake_stream, "Question?", "Evidence", [])
        )
        self.assertEqual(chunks, "Hello world")

    def test_async_stream(self):
        async def fake_stream(query, context, sources):
            yield "Hello"
            yield " world"

        chunks = asyncio.run(
            collect_stream(fake_stream, "Question?", "Evidence", [])
        )
        self.assertEqual(chunks, "Hello world")

    def test_stream_string_result(self):
        async def fake_stream(query, context, sources):
            return "Complete answer"

        chunks = asyncio.run(
            collect_stream(fake_stream, "Question?", "Evidence", [])
        )
        self.assertEqual(chunks, "Complete answer")

    def test_stream_rejects_invalid_chunk(self):
        def fake_stream(query, context, sources):
            return iter(["valid", 123])

        async def consume():
            return [
                chunk
                async for chunk in stream_answer(
                    fake_stream, "Question?", "Evidence", []
                )
            ]

        with self.assertRaises(TypeError):
            asyncio.run(consume())

    def test_stream_rejects_empty_query(self):
        async def consume():
            return [
                chunk
                async for chunk in stream_answer(
                    lambda *args: ["answer"], " ", "Evidence", []
                )
            ]

        with self.assertRaises(ValueError):
            asyncio.run(consume())


if __name__ == "__main__":
    unittest.main(verbosity=2)
