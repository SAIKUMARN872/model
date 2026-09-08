"""
Research summarization for ModelNow.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable

from .search import SearchResult


class SummarizationError(Exception):
    """Base summarization exception."""


@dataclass
class SummaryRequest:
    """Request for summarizing research material."""

    topic: str

    content: str

    max_length: int = 3000

    style: str = "concise"

    include_sources: bool = True

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if not self.topic.strip():
            raise ValueError(
                "Summary topic cannot be empty"
            )

        if not self.content.strip():
            raise ValueError(
                "Summary content cannot be empty"
            )

        if self.max_length <= 0:
            raise ValueError(
                "max_length must be positive"
            )


@dataclass
class SummaryResult:
    """Result of research summarization."""

    summary: str

    topic: str

    success: bool = True

    error: str | None = None

    key_points: list[str] = field(
        default_factory=list
    )

    sources: list[str] = field(
        default_factory=list
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "summary": self.summary,
            "topic": self.topic,
            "success": self.success,
            "error": self.error,
            "key_points": list(
                self.key_points
            ),
            "sources": list(
                self.sources
            ),
            "metadata": dict(
                self.metadata
            ),
        }


class ResearchSummarizer:
    """
    Summarizes research content.

    An external LLM can be injected through `handler`.
    """

    def __init__(
        self,
        handler: Callable[..., Any] | None = None,
    ) -> None:

        self.handler = handler

    async def summarize(
        self,
        request: SummaryRequest,
    ) -> SummaryResult:

        if self.handler is None:

            return self._fallback_summary(
                request
            )

        try:

            from .utils import execute_handler

            result = await execute_handler(
                self.handler,
                request,
            )

            return self._parse_result(
                result,
                request,
            )

        except Exception as exc:

            return SummaryResult(
                summary="",
                topic=request.topic,
                success=False,
                error=str(exc),
                metadata=request.metadata,
            )

    def _fallback_summary(
        self,
        request: SummaryRequest,
    ) -> SummaryResult:

        content = request.content.strip()

        if len(content) > request.max_length:

            summary = (
                content[: request.max_length]
                + "..."
            )

        else:

            summary = content

        key_points = self._extract_key_points(
            content
        )

        return SummaryResult(
            summary=summary,
            topic=request.topic,
            success=True,
            key_points=key_points,
            metadata=request.metadata,
        )

    def _parse_result(
        self,
        result: Any,
        request: SummaryRequest,
    ) -> SummaryResult:

        if isinstance(
            result,
            SummaryResult,
        ):
            return result

        if isinstance(
            result,
            str,
        ):

            return SummaryResult(
                summary=result.strip(),
                topic=request.topic,
                metadata=request.metadata,
            )

        if isinstance(
            result,
            dict,
        ):

            return SummaryResult(
                summary=str(
                    result.get(
                        "summary",
                        result.get(
                            "output",
                            "",
                        ),
                    )
                ),
                topic=request.topic,
                key_points=[
                    str(item)
                    for item
                    in result.get(
                        "key_points",
                        [],
                    )
                ],
                sources=[
                    str(item)
                    for item
                    in result.get(
                        "sources",
                        [],
                    )
                ],
                metadata={
                    **request.metadata,
                    **dict(
                        result.get(
                            "metadata",
                            {},
                        )
                    ),
                },
            )

        return SummaryResult(
            summary=str(result),
            topic=request.topic,
            metadata=request.metadata,
        )

    @staticmethod
    def _extract_key_points(
        content: str,
        maximum: int = 5,
    ) -> list[str]:

        sentences = [
            sentence.strip()
            for sentence in content.replace(
                "\n",
                " ",
            ).split(".")
            if sentence.strip()
        ]

        return sentences[:maximum]

    async def summarize_results(
        self,
        topic: str,
        results: list[SearchResult],
        max_length: int = 3000,
    ) -> SummaryResult:

        if not results:

            return SummaryResult(
                summary="No research results found.",
                topic=topic,
                success=False,
                error="No search results available.",
            )

        sections = []

        for index, result in enumerate(
            results,
            start=1,
        ):

            sections.append(
                f"Source {index}: "
                f"{result.title}\n"
                f"{result.snippet}\n"
                f"URL: {result.url}"
            )

        content = "\n\n".join(
            sections
        )

        request = SummaryRequest(
            topic=topic,
            content=content,
            max_length=max_length,
        )

        return await self.summarize(
            request
        )