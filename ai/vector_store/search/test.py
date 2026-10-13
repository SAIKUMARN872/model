"""Consolidated offline tests for ModelNow search."""

from __future__ import annotations

from .filters import matches_filter, validate_filter
from .hybrid_search import HybridSearch
from .retriever import Retriever
from .utils import normalize_score, validate_query, validate_top_k


def run_tests() -> None:
    metadata = {
        "source": {"type": "guide"},
        "category": "AI",
        "pages": 12,
        "tags": ["rag", "search"],
        "active": True,
    }

    assert validate_filter(None) == {}
    assert matches_filter(metadata, {"category": "AI"})
    assert matches_filter(metadata, {"pages": {"$gte": 10}})
    assert matches_filter(metadata, {"source.type": "guide"})
    assert matches_filter(metadata, {"tags": {"$contains": "rag"}})
    assert matches_filter(metadata, {"missing": {"$exists": False}})
    assert matches_filter(metadata, {"$or": [{"category": "ML"}, {"category": "AI"}]})
    assert matches_filter(metadata, {"$and": [{"active": True}, {"pages": {"$lt": 20}}]})
    assert not matches_filter(metadata, {"category": "finance"})
    print("PASS: equality, comparison, nested path, contains, exists, AND/OR filters")

    for invalid in ("", "   ", None):
        try:
            validate_query(invalid)
        except ValueError:
            pass
        else:
            raise AssertionError(f"invalid query accepted: {invalid!r}")

    for invalid in (0, -1, 1001, True, 1.5):
        try:
            validate_top_k(invalid)
        except ValueError:
            pass
        else:
            raise AssertionError(f"invalid top_k accepted: {invalid!r}")

    for invalid in ({"$bad": []}, {"category": {"$unknown": "AI"}}, {"$and": []}):
        try:
            validate_filter(invalid)
        except ValueError:
            pass
        else:
            raise AssertionError(f"invalid filter accepted: {invalid!r}")

    assert normalize_score(-1) == 0.0
    assert normalize_score(2) == 1.0
    assert normalize_score(float("nan")) == 0.0
    print("PASS: input validation and score normalization")

    semantic_data = [
        {"document_id": "doc-a", "text": "RAG architecture", "metadata": {"kind": "guide"}, "score": 0.95},
        {"document_id": "doc-b", "text": "Vector indexing", "metadata": {"kind": "reference"}, "score": 0.80},
    ]
    keyword_data = [
        {"document_id": "doc-b", "text": "Vector indexing", "metadata": {"kind": "reference"}, "score": 0.99},
        {"document_id": "doc-c", "text": "RAG retrieval", "metadata": {"kind": "guide"}, "score": 0.70},
    ]

    def semantic_search(*, query, top_k, filters):
        assert query == "RAG search"
        return semantic_data[:top_k]

    def keyword_search(*, query, top_k, filters):
        assert query == "RAG search"
        return keyword_data[:top_k]

    retriever = Retriever(semantic_search)
    retrieved = retriever.retrieve("RAG search", top_k=2)
    assert len(retrieved) == 2
    assert retrieved[0]["document_id"] == "doc-a"
    assert retriever.retrieve_one("RAG search")["document_id"] == "doc-a"
    assert retriever.retrieve("RAG search", filters={"kind": "missing"}) == []
    print("PASS: retriever ranking, filtering, top-k, and retrieve-one")

    hybrid = HybridSearch(
        semantic_search,
        keyword_search,
        semantic_weight=0.7,
        keyword_weight=0.3,
    )
    fused = hybrid.search("RAG search", top_k=5)
    ids = [item["document_id"] for item in fused]
    assert len(ids) == len(set(ids)), "hybrid results must be deduplicated"
    assert set(ids) == {"doc-a", "doc-b", "doc-c"}
    assert all(0 < item["score"] <= 1 for item in fused)
    doc_b = next(item for item in fused if item["document_id"] == "doc-b")
    assert set(doc_b["sources"]) == {"semantic", "keyword"}
    assert len(hybrid.search("RAG search", top_k=1)) == 1
    assert hybrid.search("RAG search", filters={"kind": "missing"}) == []
    print("PASS: hybrid fusion, ranking, deduplication, and source tracking")

    empty = Retriever(lambda **kwargs: [])
    assert empty.retrieve("no results") == []
    assert empty.retrieve_one("no results") is None
    print("PASS: empty results and no-result handling")

    print("MODELNOW SEARCH CONSOLIDATED TEST: PASS")


if __name__ == "__main__":
    run_tests()
