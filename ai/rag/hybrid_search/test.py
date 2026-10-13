import asyncio

from ai.rag.models import RAGDocument, RetrievedDocument
from ai.rag.hybrid_search.bm25 import BM25Retriever
from ai.rag.hybrid_search.fusion import reciprocal_rank_fusion
from ai.rag.hybrid_search.hybrid import HybridRetriever
from ai.rag.hybrid_search.utils import tokenize


DOC_A = RAGDocument(
    "a",
    "ModelNow routing engine keyword matching",
    {"category": "routing"},
)
DOC_B = RAGDocument(
    "b",
    "ModelNow semantic routing and search",
    {"category": "routing"},
)
DOC_C = RAGDocument(
    "c",
    "Cooking recipes and ingredients",
    {"category": "food"},
)


class FakeSemanticRetriever:
    """Deterministic semantic-retriever substitute for unit tests."""

    def __init__(self, documents):
        self.documents = list(documents)

    async def retrieve(self, query, top_k=5, filters=None):
        query_tokens = set(tokenize(query))
        matches = []

        for document in self.documents:
            if not query_tokens.intersection(tokenize(document.text)):
                continue

            if filters and not all(
                document.metadata.get(key) == value
                for key, value in filters.items()
            ):
                continue

            matches.append(document)

        return [
            RetrievedDocument(document, 1.0 / rank, rank)
            for rank, document in enumerate(matches[:top_k], start=1)
        ]


async def run_tests():
    keyword = BM25Retriever([DOC_A, DOC_B, DOC_C])
    semantic = FakeSemanticRetriever([DOC_B, DOC_A, DOC_C])
    hybrid = HybridRetriever(keyword, semantic)

    results = await hybrid.retrieve("ModelNow routing", top_k=3)
    assert results
    assert len({item.document.document_id for item in results}) == len(results)
    assert [item.rank for item in results] == list(range(1, len(results) + 1))
    print("PASS - HYBRID KEYWORD AND SEMANTIC RETRIEVAL")

    filtered = await hybrid.retrieve(
        "ModelNow routing",
        top_k=5,
        filters={"category": "routing"},
    )
    assert filtered
    assert all(
        item.document.metadata["category"] == "routing"
        for item in filtered
    )
    print("PASS - METADATA FILTERING")

    keyword_only = HybridRetriever(keyword)
    keyword_results = await keyword_only.retrieve("ModelNow", top_k=2)
    assert len(keyword_results) <= 2
    assert keyword_results
    print("PASS - KEYWORD-ONLY MODE")

    limited = await hybrid.retrieve("ModelNow routing", top_k=1)
    assert len(limited) <= 1
    print("PASS - TOP K LIMIT")

    empty = await hybrid.retrieve("unmatchedtermxyz", top_k=3)
    assert empty == []
    print("PASS - EMPTY MATCH HANDLING")

    invalid_query_rejected = False
    try:
        await hybrid.retrieve("   ")
    except ValueError:
        invalid_query_rejected = True
    assert invalid_query_rejected
    print("PASS - INVALID QUERY VALIDATION")

    doc_x = RAGDocument("x", "keyword result")
    doc_y = RAGDocument("y", "semantic result")
    keyword_list = [
        RetrievedDocument(doc_x, 2.0, 1),
        RetrievedDocument(doc_y, 1.0, 2),
    ]
    semantic_list = [
        RetrievedDocument(doc_y, 0.9, 1),
        RetrievedDocument(doc_x, 0.8, 2),
    ]
    fused = reciprocal_rank_fusion([keyword_list, semantic_list])
    assert len(fused) == 2
    assert len({item.document.document_id for item in fused}) == 2
    assert [item.rank for item in fused] == [1, 2]
    print("PASS - RRF FUSION AND DEDUPLICATION")

    empty_fusion = reciprocal_rank_fusion([])
    assert empty_fusion == []
    print("PASS - EMPTY FUSION INPUT")

    print("ALL HYBRID SEARCH TESTS PASSED")


if __name__ == "__main__":
    asyncio.run(run_tests())
