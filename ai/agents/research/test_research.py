"""Unit tests for ModelNow's research agent."""

from __future__ import annotations

import json
import unittest

from ai.agents.constants import AgentStatus
from ai.agents.models import AgentRequest
from ai.agents.research import ResearchAgent
from ai.agents.research.search import SearchClient
from ai.agents.research.summarizer import Summarizer


class ResearchAgentTests(unittest.IsolatedAsyncioTestCase):
    async def test_research_returns_summary_and_sources(self):
        def fake_search(query, limit=5):
            return [
                {
                    "title": "Example Source",
                    "url": "https://example.com/research",
                    "snippet": f"Evidence related to {query}",
                }
            ]

        agent = ResearchAgent(
            search_client=SearchClient(fake_search),
            summarizer=Summarizer(
                lambda query, sources: f"Summary about {query}"
            ),
        )

        response = await agent.run(
            AgentRequest(input="AI research", task_id="task-1")
        )

        self.assertEqual(response.status, AgentStatus.COMPLETED)
        self.assertEqual(response.task_id, "task-1")

        result = json.loads(response.output)
        self.assertEqual(result["query"], "AI research")
        self.assertEqual(result["summary"], "Summary about AI research")
        self.assertEqual(result["source_count"], 1)
        self.assertEqual(result["sources"][0]["title"], "Example Source")

    async def test_async_search_and_summarizer(self):
        async def fake_search(query, limit=5):
            return [{"title": "Async source", "snippet": "Async evidence"}]

        async def fake_summarize(query, sources):
            return "Async summary"

        agent = ResearchAgent(
            search_client=SearchClient(fake_search),
            summarizer=Summarizer(fake_summarize),
        )
        response = await agent.run(AgentRequest(input="Async research"))

        self.assertEqual(response.status, AgentStatus.COMPLETED)
        self.assertEqual(json.loads(response.output)["summary"], "Async summary")

    async def test_missing_search_provider_fails_cleanly(self):
        agent = ResearchAgent()
        response = await agent.run(AgentRequest(input="Research this topic"))

        self.assertEqual(response.status, AgentStatus.FAILED)
        self.assertIn("search provider", response.error.lower())

    async def test_empty_query_fails_cleanly(self):
        from ai.agents.exceptions import AgentValidationError

        with self.assertRaises(AgentValidationError):
            AgentRequest(input="   ")

    async def test_search_limit_can_be_overridden(self):
        captured = {}

        def fake_search(query, limit=5):
            captured["limit"] = limit
            return []

        agent = ResearchAgent(search_client=SearchClient(fake_search))
        response = await agent.run(
            AgentRequest(input="Research", metadata={"max_results": 3})
        )

        self.assertEqual(response.status, AgentStatus.COMPLETED)
        self.assertEqual(captured["limit"], 3)

    async def test_invalid_limit_fails_cleanly(self):
        agent = ResearchAgent(
            search_client=SearchClient(lambda q, limit=5: [])
        )
        response = await agent.run(
            AgentRequest(input="Research", metadata={"max_results": 0})
        )

        self.assertEqual(response.status, AgentStatus.FAILED)

    async def test_search_client_normalizes_string_results(self):
        client = SearchClient(lambda query, limit=5: ["A source"])
        results = await client.search("topic")

        self.assertEqual(results[0]["title"], "A source")
        self.assertEqual(results[0]["snippet"], "A source")

    async def test_search_client_requires_provider(self):
        client = SearchClient()
        with self.assertRaises(RuntimeError):
            await client.search("topic")

    async def test_summarizer_fallback(self):
        summarizer = Summarizer()
        result = await summarizer.summarize(
            "topic", [{"title": "Source", "url": "", "snippet": "Evidence"}]
        )
        self.assertIn("Evidence", result)

    async def test_summarizer_rejects_non_string(self):
        summarizer = Summarizer(lambda query, sources: {"summary": "bad"})
        with self.assertRaises(ValueError):
            await summarizer.summarize("topic", [])


if __name__ == "__main__":
    unittest.main()

