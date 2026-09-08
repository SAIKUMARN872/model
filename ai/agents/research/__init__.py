"""
ModelNow Research package.

Provides search, research analysis, source processing,
summarization, and a research agent.
"""

from .research_agent import (
    ResearchAgent,
    ResearchAgentError,
    ResearchConfig,
    ResearchResult,
)

from .search import (
    SearchError,
    SearchProvider,
    SearchRequest,
    SearchResponse,
    SearchResult,
)

from .summarizer import (
    ResearchSummarizer,
    SummarizationError,
    SummaryRequest,
    SummaryResult,
)

from .utils import (
    build_research_prompt,
    clean_text,
    deduplicate_urls,
    execute_handler,
    extract_urls,
    merge_metadata,
    normalize_query,
    truncate_text,
    word_count,
)


__all__ = [
    # Research Agent
    "ResearchAgent",
    "ResearchConfig",
    "ResearchResult",
    "ResearchAgentError",

    # Search
    "SearchProvider",
    "SearchRequest",
    "SearchResponse",
    "SearchResult",
    "SearchError",

    # Summarizer
    "ResearchSummarizer",
    "SummaryRequest",
    "SummaryResult",
    "SummarizationError",

    # Utilities
    "execute_handler",
    "normalize_query",
    "clean_text",
    "deduplicate_urls",
    "extract_urls",
    "build_research_prompt",
    "truncate_text",
    "word_count",
    "merge_metadata",
]


__version__ = "1.0.0"