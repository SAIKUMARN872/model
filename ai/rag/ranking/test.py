import asyncio

from ai.rag.ranking import (
    RAGReranker,
    RankingDocument,
    filter_by_document_ids,
    filter_by_min_score,
    sort_by_score,
    top_results,
)


async def main():
    documents = [
        RankingDocument(
            text="ModelNow optimizes AI model cost, latency, and quality.",
            document_id="modelnow",
            metadata={"source": "architecture.md"},
        ),
        RankingDocument(
            text="Cost optimization selects efficient AI models.",
            document_id="cost",
            metadata={"source": "routing.md"},
        ),
        RankingDocument(
            text="A recipe for chocolate cake.",
            document_id="recipe",
            metadata={"source": "recipe.txt"},
        ),
    ]

    reranker = RAGReranker(provider_id="bge")

    results = await reranker.rerank(
        query="ModelNow cost optimization",
        documents=documents,
        top_n=2,
    )

    assert len(results) == 2
    print("PASS - RAG RERANKING")

    assert results[0].score >= results[1].score
    print("PASS - RESULT SCORE ORDERING")

    assert results[0].provider == "bge"
    assert results[0].model
    print("PASS - PROVIDER AND MODEL METADATA")

    assert results[0].document.document_id == "modelnow"
    assert results[0].document.metadata["source"] == "architecture.md"
    print("PASS - DOCUMENT ID AND METADATA PRESERVATION")

    sorted_results = sort_by_score(results)
    assert sorted_results[0].score >= sorted_results[-1].score
    print("PASS - SCORE SORTING")

    assert len(top_results(results, 1)) == 1
    assert top_results(results, 0) == []
    print("PASS - TOP-N SELECTION")

    filtered = filter_by_document_ids(
        results,
        {"modelnow"},
    )
    assert all(
        result.document.document_id == "modelnow"
        for result in filtered
    )
    print("PASS - DOCUMENT ID FILTER")

    minimum_score = min(result.score for result in results)
    filtered_scores = filter_by_min_score(results, minimum_score)
    assert len(filtered_scores) == len(results)
    print("PASS - MINIMUM SCORE FILTER")

    print("PASS - RAG RERANKER INTEGRATION TEST")


if __name__ == "__main__":
    asyncio.run(main())
