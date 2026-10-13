"""Transparent lexical relevance scoring for registered tools."""

from __future__ import annotations

import re
from typing import Any


def tokenize(text: str) -> set[str]:
    """Normalize text into a set of meaningful alphanumeric tokens."""
    return {
        token
        for token in re.findall(r"[a-zA-Z0-9_]+", text.casefold())
        if len(token) > 1
    }


class ToolScorer:
    """Score tool relevance using names, tags, and descriptions."""

    def score(self, tool: Any, request_text: str) -> float:
        if not isinstance(request_text, str):
            raise TypeError("request_text must be a string.")

        query = tokenize(request_text)
        if not query:
            return 0.0

        name_tokens = tokenize(tool.name)
        tag_tokens = tokenize(" ".join(tool.tags))
        description_tokens = tokenize(tool.description)

        matched_weight = 0
        for token in query:
            if token in name_tokens:
                matched_weight += 3
            elif token in tag_tokens:
                matched_weight += 2
            elif token in description_tokens:
                matched_weight += 1

        score = matched_weight / (3 * len(query))

        searchable = (
            f"{tool.name} {tool.description} {' '.join(tool.tags)}"
        ).casefold()
        normalized_request = " ".join(request_text.casefold().split())

        if normalized_request and normalized_request in searchable:
            score += 0.1

        return round(min(score, 1.0), 6)
