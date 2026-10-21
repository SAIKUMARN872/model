from __future__ import annotations

from ai.rag.models import RAGRequest, RAGResponse
from ai.rag.pipeline.pipeline import RAGPipeline


class RAGPipelineExecutor:
    """Public execution entry point for a configured RAG pipeline."""

    def __init__(self, pipeline: RAGPipeline) -> None:
        self.pipeline = pipeline

    async def execute(self, request: RAGRequest) -> RAGResponse:
        return await self.pipeline.run(request)


__all__ = ["RAGPipelineExecutor"]


