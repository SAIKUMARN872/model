from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RequestFeatures:
    text: str
    text_length: int
    estimated_tokens: int

    has_code_keywords: bool
    has_reasoning_keywords: bool
    has_writing_keywords: bool
    has_summary_keywords: bool
    has_extraction_keywords: bool
    has_translation_keywords: bool
    has_analysis_keywords: bool
    has_tool_keywords: bool
    has_agentic_keywords: bool


def estimate_tokens(text: str) -> int:
    if not text:
        return 0

    # Lightweight approximation for routing.
    # The actual tokenizer remains owned by the inference/provider layer.
    return max(1, len(text) // 4)


def extract_features(text: str) -> RequestFeatures:
    normalized = text.lower().strip()

    code_keywords = (
        "code",
        "python",
        "javascript",
        "typescript",
        "java",
        "sql",
        "program",
        "function",
        "class",
        "debug",
        "bug",
        "api",
        "script",
        "algorithm",
    )

    reasoning_keywords = (
        "why",
        "explain why",
        "reason",
        "reasoning",
        "prove",
        "derive",
        "solve",
        "step by step",
        "calculate",
        "logic",
    )

    writing_keywords = (
        "write",
        "rewrite",
        "draft",
        "email",
        "essay",
        "story",
        "caption",
        "article",
        "paragraph",
    )

    summary_keywords = (
        "summarize",
        "summary",
        "shorten",
        "key points",
        "give me the main points",
    )

    extraction_keywords = (
        "extract",
        "find all",
        "identify",
        "parse",
        "list the",
        "entities",
    )

    translation_keywords = (
        "translate",
        "translation",
        "in hindi",
        "in english",
        "in tamil",
        "in telugu",
        "in spanish",
        "in french",
    )

    analysis_keywords = (
        "analyze",
        "analysis",
        "compare",
        "comparison",
        "evaluate",
        "assess",
        "review",
        "pros and cons",
    )

    tool_keywords = (
        "search the web",
        "browse",
        "open website",
        "click",
        "book",
        "buy",
        "order",
        "send",
        "upload",
        "download",
    )

    agentic_keywords = (
        "automate",
        "automation",
        "do this for me",
        "complete this task",
        "execute",
        "workflow",
        "agent",
        "multi-step",
    )

    return RequestFeatures(
        text=text,
        text_length=len(text),
        estimated_tokens=estimate_tokens(text),
        has_code_keywords=any(
            keyword in normalized for keyword in code_keywords
        ),
        has_reasoning_keywords=any(
            keyword in normalized for keyword in reasoning_keywords
        ),
        has_writing_keywords=any(
            keyword in normalized for keyword in writing_keywords
        ),
        has_summary_keywords=any(
            keyword in normalized for keyword in summary_keywords
        ),
        has_extraction_keywords=any(
            keyword in normalized for keyword in extraction_keywords
        ),
        has_translation_keywords=any(
            keyword in normalized for keyword in translation_keywords
        ),
        has_analysis_keywords=any(
            keyword in normalized for keyword in analysis_keywords
        ),
        has_tool_keywords=any(
            keyword in normalized for keyword in tool_keywords
        ),
        has_agentic_keywords=any(
            keyword in normalized for keyword in agentic_keywords
        ),
    )


__all__ = [
    "RequestFeatures",
    "estimate_tokens",
    "extract_features",
]
