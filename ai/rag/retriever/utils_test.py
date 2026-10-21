from __future__ import annotations

import math

from ai.rag.models import RAGDocument, RetrievedDocument
from ai.rag.retriever.utils import (
    rank_results,
    validate_filters,
    validate_query,
    validate_retrieved_documents,
    validate_score,
    validate_top_k,
)


def test_query_validation() -> None:
    assert validate_query("  ModelNow RAG  ") == "ModelNow RAG"

    for query in ("", "   "):
        try:
            validate_query(query)
        except ValueError:
            pass
        else:
            raise AssertionError("Empty queries must be rejected.")

    try:
        validate_query(123)  # type: ignore[arg-type]
    except TypeError:
        pass
    else:
        raise AssertionError("Non-string queries must be rejected.")


def test_top_k_validation() -> None:
    assert validate_top_k(5) == 5

    for value in (0, -1):
        try:
            validate_top_k(value)
        except ValueError:
            pass
        else:
            raise AssertionError("Non-positive top_k must be rejected.")

    for value in (True, 1.5, "5"):
        try:
            validate_top_k(value)  # type: ignore[arg-type]
        except TypeError:
            pass
        else:
            raise AssertionError("Invalid top_k types must be rejected.")


def test_filter_validation() -> None:
    original = {"category": "AI"}
    result = validate_filters(original)

    assert result == original
    assert result is not original
    assert validate_filters(None) == {}

    for filters in ([], "category"):
        try:
            validate_filters(filters)  # type: ignore[arg-type]
        except TypeError:
            pass
        else:
            raise AssertionError("Invalid filter containers must be rejected.")

    try:
        validate_filters({" ": "value"})
    except ValueError:
        pass
    else:
        raise AssertionError("Blank filter keys must be rejected.")


def test_score_validation() -> None:
    assert validate_score(0.75) == 0.75
    assert validate_score(1) == 1.0

    for score in (math.nan, math.inf, -math.inf):
        try:
            validate_score(score)
        except ValueError:
            pass
        else:
            raise AssertionError("Non-finite scores must be rejected.")

    for score in (True, "0.5"):
        try:
            validate_score(score)  # type: ignore[arg-type]
        except TypeError:
            pass
        else:
            raise AssertionError("Non-numeric scores must be rejected.")


def test_result_validation() -> None:
    document = RAGDocument("doc-1", "ModelNow retrieval")
    results = [RetrievedDocument(document, score=0.8)]

    validated = validate_retrieved_documents(results)

    assert len(validated) == 1
    assert validated[0].document.document_id == "doc-1"

    try:
        validate_retrieved_documents(results + results)
    except ValueError:
        pass
    else:
        raise AssertionError("Duplicate result IDs must be rejected.")

    try:
        validate_retrieved_documents(["invalid"])  # type: ignore[list-item]
    except TypeError:
        pass
    else:
        raise AssertionError("Invalid result items must be rejected.")


def test_result_ranking_and_top_k() -> None:
    documents = [
        RetrievedDocument(RAGDocument("low", "Low score"), score=0.2),
        RetrievedDocument(RAGDocument("high", "High score"), score=0.9),
        RetrievedDocument(RAGDocument("mid", "Medium score"), score=0.5),
        RetrievedDocument(RAGDocument("tie", "Tied score"), score=0.5),
    ]

    ranked = rank_results(documents)

    assert [item.document.document_id for item in ranked] == [
        "high", "mid", "tie", "low"
    ]
    assert [item.rank for item in ranked] == [1, 2, 3, 4]
    assert [item.document.document_id for item in rank_results(documents, 2)] == [
        "high", "mid"
    ]


def main() -> None:
    tests = [
        test_query_validation,
        test_top_k_validation,
        test_filter_validation,
        test_score_validation,
        test_result_validation,
        test_result_ranking_and_top_k,
    ]

    for test in tests:
        test()
        print(f"PASS - {test.__name__.replace('_', ' ').upper()}")

    print("PASS - RETRIEVER UTILS INTEGRATION TEST")


if __name__ == "__main__":
    main()
