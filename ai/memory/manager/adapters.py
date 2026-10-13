from __future__ import annotations

import re
from typing import Any, Mapping, Sequence

from ai.memory.manager.utils import MemoryContext, MemoryItem
from ai.memory.short_term.manager import ShortTermMemoryManager
from ai.memory.long_term.memory import LongTermMemory
from ai.memory.semantic.memory import SemanticMemory
from ai.memory.semantic.retriever import SemanticRetriever


_TOKEN_PATTERN = re.compile(r"[a-zA-Z0-9_]{2,}")


def _tokens(value: str) -> set[str]:
    return {token.casefold() for token in _TOKEN_PATTERN.findall(value)}


def _relevance(query: str, content: str) -> float:
    query_tokens = _tokens(query)
    if not query_tokens:
        return 0.0
    content_tokens = _tokens(content)
    return len(query_tokens & content_tokens) / len(query_tokens)


class ShortTermMemoryBackend:
    """Adapter exposing short-term memory through MemoryManager."""

    name = "short_term"

    def __init__(self, memory: ShortTermMemoryManager | None = None) -> None:
        self.memory = memory or ShortTermMemoryManager()

    def write(
        self,
        context: MemoryContext,
        content: str,
        *,
        category: str,
        metadata: Mapping[str, Any],
    ) -> str:
        record = self.memory.remember(
            context.tenant_id,
            context.user_id,
            content,
            category=category,
            metadata=metadata,
        )
        return record.memory_id

    def search(
        self,
        context: MemoryContext,
        query: str,
        *,
        limit: int,
        category: str | None = None,
    ) -> Sequence[MemoryItem]:
        records = self.memory.recall(
            context.tenant_id,
            context.user_id,
            query=query,
            category=category,
            limit=limit,
        )
        results: list[MemoryItem] = []

        for record in records:
            score = _relevance(query, record.content)
            if score <= 0:
                continue
            results.append(
                MemoryItem(
                    memory_id=record.memory_id,
                    backend=self.name,
                    content=record.content,
                    category=record.category,
                    score=score,
                    metadata=record.metadata,
                    created_at=record.created_at,
                )
            )

        return results

    def delete(self, context: MemoryContext, memory_id: str) -> bool:
        return self.memory.forget(
            context.tenant_id, context.user_id, memory_id
        )


class LongTermMemoryBackend:
    """Adapter exposing long-term memory through MemoryManager."""

    name = "long_term"

    def __init__(self, memory: LongTermMemory | None = None) -> None:
        self.memory = memory or LongTermMemory()

    def write(
        self,
        context: MemoryContext,
        content: str,
        *,
        category: str,
        metadata: Mapping[str, Any],
    ) -> str:
        record = self.memory.save(
            context.tenant_id,
            context.user_id,
            content,
            category=category,
            metadata=metadata,
        )
        return record.memory_id

    def search(
        self,
        context: MemoryContext,
        query: str,
        *,
        limit: int,
        category: str | None = None,
    ) -> Sequence[MemoryItem]:
        matches = self.memory.search(
            context.tenant_id,
            context.user_id,
            query,
            limit=min(100, max(limit, limit * 3)),
            category=category,
        )
        results: list[MemoryItem] = []

        for match in matches:
            record = match.record
            # Do not return a memory solely because it is recent or important:
            # the query must have some lexical overlap with its content.
            if match.relevance <= 0:
                continue
            results.append(
                MemoryItem(
                    memory_id=record.memory_id,
                    backend=self.name,
                    content=record.content,
                    category=record.category,
                    score=match.score,
                    metadata=record.metadata,
                    created_at=record.created_at,
                )
            )
            if len(results) >= limit:
                break

        return results

    def delete(self, context: MemoryContext, memory_id: str) -> bool:
        return self.memory.delete(
            context.tenant_id, context.user_id, memory_id
        )


class SemanticMemoryBackend:
    """Adapter exposing semantic knowledge through MemoryManager."""

    name = "semantic"

    def __init__(
        self,
        memory: SemanticMemory | None = None,
        retriever: SemanticRetriever | None = None,
    ) -> None:
        self.memory = memory or SemanticMemory()
        if retriever is not None and retriever.memory is not self.memory:
            raise ValueError("retriever must use the supplied semantic memory")
        self.retriever = retriever or SemanticRetriever(self.memory)

    def write(
        self,
        context: MemoryContext,
        content: str,
        *,
        category: str,
        metadata: Mapping[str, Any],
    ) -> str:
        record = self.memory.add(
            context.tenant_id,
            context.user_id,
            content,
            category=category,
            metadata=metadata,
        )
        return record.knowledge_id

    def search(
        self,
        context: MemoryContext,
        query: str,
        *,
        limit: int,
        category: str | None = None,
    ) -> Sequence[MemoryItem]:
        matches = self.retriever.search(
            context.tenant_id,
            context.user_id,
            query,
            limit=min(100, max(limit, limit * 3)),
            category=category,
        )
        results: list[MemoryItem] = []

        for match in matches:
            record = match.knowledge
            # Confidence alone must not make unrelated knowledge relevant.
            if match.lexical_relevance <= 0:
                continue
            results.append(
                MemoryItem(
                    memory_id=record.knowledge_id,
                    backend=self.name,
                    content=record.content,
                    category=record.category,
                    score=match.score,
                    metadata=record.metadata,
                    created_at=record.created_at,
                )
            )
            if len(results) >= limit:
                break

        return results

    def delete(self, context: MemoryContext, memory_id: str) -> bool:
        return self.memory.delete(
            context.tenant_id, context.user_id, memory_id
        )
