"""
Main research agent for ModelNow.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable

from agents.base import (
    BaseAgent,
    BaseAgentConfig,
    BaseAgentContext,
    BaseAgentState,
)

from .search import (
    SearchProvider,
    SearchRequest,
    SearchResult,
)
from .summarizer import (
    ResearchSummarizer,
)
from .utils import (
    deduplicate_urls,
    normalize_query,
)


class ResearchAgentError(Exception):
    """Base research agent exception."""


@dataclass
class ResearchConfig:
    """
    Configuration for ResearchAgent.
    """

    name: str = "research-agent"

    description: str = (
        "ModelNow research and information analysis agent"
    )

    system_prompt: str = (
        "You are a research assistant. "
        "Analyze sources carefully, avoid unsupported "
        "claims, and distinguish facts from uncertainty."
    )

    max_results: int = 10

    recency_days: int | None = None

    language: str = "en"

    summarize: bool = True

    max_summary_length: int = 3000

    max_iterations: int = 10

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if self.max_results <= 0:
            raise ValueError(
                "max_results must be positive"
            )

        if (
            self.recency_days is not None
            and self.recency_days < 0
        ):
            raise ValueError(
                "recency_days cannot be negative"
            )

        if self.max_summary_length <= 0:
            raise ValueError(
                "max_summary_length must be positive"
            )


@dataclass
class ResearchResult:
    """
    Complete research result.
    """

    query: str

    success: bool

    results: list[SearchResult] = field(
        default_factory=list
    )

    summary: str = ""

    key_points: list[str] = field(
        default_factory=list
    )

    sources: list[str] = field(
        default_factory=list
    )

    error: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "query": self.query,
            "success": self.success,
            "results": [
                result.to_dict()
                for result in self.results
            ],
            "summary": self.summary,
            "key_points": list(
                self.key_points
            ),
            "sources": list(
                self.sources
            ),
            "error": self.error,
            "metadata": dict(
                self.metadata
            ),
        }


class ResearchAgent(BaseAgent):
    """
    Agent responsible for research workflows.

    Flow:

        Query
          ↓
        Search
          ↓
        Deduplicate
          ↓
        Rank
          ↓
        Summarize
          ↓
        ResearchResult
    """

    def __init__(
        self,
        config: ResearchConfig | None = None,
        search_handler: Callable[
            ...,
            Any,
        ] | None = None,
        summarization_handler: Callable[
            ...,
            Any,
        ] | None = None,
        tools: dict[
            str,
            Callable[..., Any],
        ] | None = None,
    ) -> None:

        config = (
            config
            or ResearchConfig()
        )

        self.research_config = config

        self.search_provider = SearchProvider(
            handler=search_handler
        )

        self.summarizer = ResearchSummarizer(
            handler=summarization_handler
        )

        self.last_research: ResearchResult | None = None

        super().__init__(
            config=BaseAgentConfig(
                name=config.name,
                description=config.description,
                system_prompt=config.system_prompt,
                max_iterations=config.max_iterations,
                metadata=config.metadata,
            ),
            tools=tools,
        )

    async def execute(
        self,
        context: BaseAgentContext,
        state: BaseAgentState,
    ) -> Any:
        """
        Execute a research request.
        """

        result = await self.research(
            query=context.user_input,
            metadata=context.metadata,
        )

        if not result.success:

            raise ResearchAgentError(
                result.error
                or "Research failed"
            )

        context.set(
            "research_result",
            result.to_dict(),
        )

        return self.format_result(
            result
        )

    async def research(
        self,
        query: str,
        metadata: dict[str, Any] | None = None,
    ) -> ResearchResult:

        query = normalize_query(
            query
        )

        request = SearchRequest(
            query=query,
            max_results=(
                self.research_config.max_results
            ),
            language=(
                self.research_config.language
            ),
            recency_days=(
                self.research_config.recency_days
            ),
            metadata=metadata or {},
        )

        search_response = (
            await self.search_provider.search(
                request
            )
        )

        if not search_response.success:

            result = ResearchResult(
                query=query,
                success=False,
                error=search_response.error,
                metadata=metadata or {},
            )

            self.last_research = result

            return result

        results = deduplicate_urls(
            search_response.results
        )

        summary = ""
        key_points: list[str] = []
        sources = [
            result.url
            for result in results
        ]

        if (
            self.research_config.summarize
            and results
        ):

            summary_result = (
                await self.summarizer.summarize_results(
                    topic=query,
                    results=results,
                    max_length=(
                        self.research_config
                        .max_summary_length
                    ),
                )
            )

            summary = summary_result.summary

            key_points = (
                summary_result.key_points
            )

        result = ResearchResult(
            query=query,
            success=True,
            results=results,
            summary=summary,
            key_points=key_points,
            sources=sources,
            metadata=metadata or {},
        )

        self.last_research = result

        return result

    async def search(
        self,
        query: str,
        max_results: int | None = None,
    ):

        request = SearchRequest(
            query=normalize_query(query),
            max_results=(
                max_results
                or self.research_config.max_results
            ),
            language=(
                self.research_config.language
            ),
        )

        return await self.search_provider.search(
            request
        )

    async def summarize(
        self,
        topic: str,
        results: list[SearchResult],
    ):

        return await self.summarizer.summarize_results(
            topic=topic,
            results=results,
            max_length=(
                self.research_config
                .max_summary_length
            ),
        )

    @staticmethod
    def format_result(
        result: ResearchResult,
    ) -> str:

        sections = [
            f"Research: {result.query}",
            "",
        ]

        if result.summary:

            sections.extend(
                [
                    "Summary:",
                    result.summary,
                    "",
                ]
            )

        if result.key_points:

            sections.append(
                "Key Points:"
            )

            for point in result.key_points:

                sections.append(
                    f"- {point}"
                )

            sections.append("")

        if result.sources:

            sections.append(
                "Sources:"
            )

            for source in result.sources:

                sections.append(
                    f"- {source}"
                )

        return "\n".join(
            sections
        )