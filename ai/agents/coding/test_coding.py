from __future__ import annotations

import unittest

from ..constants import AgentStatus
from ..models import AgentContext, AgentRequest
from .coding_agent import CodingAgent
from .generator import GeneratedCode
from .reviewer import ReviewResult
from .utils import detect_language, validate_coding_request


class FakeGenerator:
    def __init__(self, result="print('hello')"):
        self.result = result
        self.calls = []

    async def generate(self, prompt: str, *, language: str = "python"):
        self.calls.append((prompt, language))
        return self.result


class FakeReviewer:
    def __init__(self, result=None):
        self.result = result or ReviewResult(
            summary="Review completed.",
            issues=("Consider handling empty input.",),
            suggestions=("Add a unit test for the empty-input case.",),
        )
        self.calls = []

    async def review(self, code: str, *, language: str = "python"):
        self.calls.append((code, language))
        return self.result


class CodingAgentTests(unittest.IsolatedAsyncioTestCase):
    async def test_generates_code_with_default_language(self):
        generator = FakeGenerator("def greet():\n    return 'hello'")
        agent = CodingAgent(generator, review_generated_code=False)

        response = await agent.run(
            AgentRequest(input="Write a greet function")
        )

        self.assertEqual(response.status, AgentStatus.COMPLETED)
        self.assertIn("def greet()", response.output)
        self.assertEqual(generator.calls[0][1], "python")
        self.assertIn("was not executed", response.output)

    async def test_uses_request_language_metadata(self):
        generator = FakeGenerator("const answer = 42;")
        agent = CodingAgent(generator, review_generated_code=False)

        response = await agent.run(
            AgentRequest(
                input="Create a constant",
                metadata={"language": "js"},
            )
        )

        self.assertEqual(response.status, AgentStatus.COMPLETED)
        self.assertEqual(generator.calls[0][1], "javascript")

    async def test_reviews_generated_code(self):
        generator = FakeGenerator("print('hello')")
        reviewer = FakeReviewer()
        agent = CodingAgent(generator, reviewer)

        response = await agent.run(AgentRequest(input="Write hello code"))

        self.assertEqual(response.status, AgentStatus.COMPLETED)
        self.assertEqual(len(reviewer.calls), 1)
        self.assertIn("Consider handling empty input.", response.output)
        self.assertIn("Add a unit test", response.output)

    async def test_context_language_is_used(self):
        generator = FakeGenerator("console.log('hi')")
        agent = CodingAgent(generator, review_generated_code=False)
        context = AgentContext(metadata={"language": "ts"})

        await agent.run(AgentRequest(input="Log hi", context=context))

        self.assertEqual(generator.calls[0][1], "typescript")

    async def test_empty_generated_code_fails_cleanly(self):
        agent = CodingAgent(FakeGenerator("   "), review_generated_code=False)

        response = await agent.run(AgentRequest(input="Write code"))

        self.assertEqual(response.status, AgentStatus.FAILED)
        self.assertIn("empty code", response.error)

    async def test_generator_exception_is_normalized(self):
        class BrokenGenerator:
            async def generate(self, prompt: str, *, language: str = "python"):
                raise RuntimeError("provider unavailable")

        agent = CodingAgent(BrokenGenerator(), review_generated_code=False)
        response = await agent.run(AgentRequest(input="Write code"))

        self.assertEqual(response.status, AgentStatus.FAILED)
        self.assertIn("provider unavailable", response.error)

    async def test_reviewer_can_be_disabled(self):
        reviewer = FakeReviewer()
        agent = CodingAgent(
            FakeGenerator(),
            reviewer,
            review_generated_code=False,
        )

        response = await agent.run(AgentRequest(input="Write code"))

        self.assertEqual(response.status, AgentStatus.COMPLETED)
        self.assertEqual(reviewer.calls, [])
        self.assertNotIn("Code review:", response.output)

    async def test_rejects_empty_prompt(self):
        from ..exceptions import AgentValidationError

        with self.assertRaises(AgentValidationError):
            AgentRequest(input="   ")

    async def test_detect_language_alias(self):
        self.assertEqual(detect_language("Py"), "python")
        self.assertEqual(detect_language("JS"), "javascript")

    async def test_rejects_unknown_language(self):
        with self.assertRaises(ValueError):
            detect_language("made-up-language")

    async def test_validates_prompt(self):
        self.assertEqual(
            validate_coding_request("  create function  "),
            "create function",
        )

        with self.assertRaises(ValueError):
            validate_coding_request(" ")

    async def test_generated_code_model_validation(self):
        result = GeneratedCode(
            code="x = 1",
            language="python",
            explanation="Assign x",
        )

        self.assertEqual(result.code, "x = 1")

        with self.assertRaises(ValueError):
            GeneratedCode(code="", language=" ")

    async def test_review_result_validation(self):
        with self.assertRaises(TypeError):
            ReviewResult(issues=["not a tuple"])


if __name__ == "__main__":
    unittest.main()

