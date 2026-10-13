from __future__ import annotations

import inspect
from collections.abc import Callable, Sequence
from typing import Any

from .utils import normalize_answer, validate_context, validate_query

GeneratorCallable = Callable[..., Any]


class RAGGenerator:
    """Generate answers through an injected synchronous or asynchronous callable."""

    def __init__(self, generate_fn: GeneratorCallable) -> None:
        if not callable(generate_fn):
            raise TypeError("generate_fn must be callable")
        self._generate_fn = generate_fn

    async def generate(
        self,
        query: str,
        context: str,
        sources: Sequence[Any],
    ) -> str:
        query = validate_query(query)
        context = validate_context(context)

        result = self._generate_fn(query, context, sources)
        if inspect.isawaitable(result):
            result = await result

        return normalize_answer(result)


DefaultRAGGenerator = RAGGenerator
