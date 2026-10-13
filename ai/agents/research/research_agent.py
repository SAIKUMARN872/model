"""Research agent integrated with ModelNow's BaseAgent."""

from __future__ import annotations

import json
from typing import Any

from ..base.agent import BaseAgent
from ..models import AgentContext, AgentRequest
from .search import SearchClient
from .summarizer import Summarizer
from .utils import truncate_text, validate_research_query


class ResearchAgent(BaseAgent):
    """Search for information and produce a structured research summary.

    Search and summarization providers are injected, so the agent can be
    tested without external services or credentials.
    """

    def __init__(
        self,
        search_client: SearchClient | None = None,
        summarizer: Summarizer | None = None,
        name: str = "Research Agent",
        max_results: int = 5,
    ) -> None:
        super().__init__(agent_id="research-agent", name=name)

        if not isinstance(max_results, int) or isinstance(max_results, bool):
            raise ValueError("max_results must be an integer.")
        if not 1 <= max_results <= 20:
            raise ValueError("max_results must be between 1 and 20.")

        self.search_client = search_client or SearchClient()
        self.summarizer = summarizer or Summarizer()
        self.max_results = max_results

    async def execute(
        self, request: AgentRequest, context: AgentContext
    ) -> str:
        query = validate_research_query(request.input)

        requested_limit = request.metadata.get(
            "max_results", context.metadata.get("max_results", self.max_results)
        )
        if (
            not isinstance(requested_limit, int)
            or isinstance(requested_limit, bool)
            or not 1 <= requested_limit <= 20
        ):
            raise ValueError("max_results must be an integer between 1 and 20.")

        sources = await self.search_client.search(query, limit=requested_limit)
        summary = await self.summarizer.summarize(query, sources)

        result: dict[str, Any] = {
            "query": query,
            "summary": truncate_text(summary),
            "sources": sources,
            "source_count": len(sources),
            "disclaimer": (
                "Results depend on the configured search provider. "
                "Verify important claims against the original sources."
            ),
        }

        return json.dumps(result, ensure_ascii=False)

