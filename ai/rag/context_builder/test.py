from __future__ import annotations

from ai.rag.models import RAGDocument, RetrievedDocument
from ai.rag.context_builder import (
    ContextBuilder,
    ContextWindow,
    truncate_text,
)


def make_source(
    document_id: str,
    text: str,
    score: float = 0.9,
    rank: int = 1,
) -> RetrievedDocument:
    return RetrievedDocument(
        document=RAGDocument(
            document_id=document_id,
            text=text,
            metadata={"origin": "test"},
        ),
        score=score,
        rank=rank,
    )


def test_source_formatting() -> None:
    result = ContextBuilder().build([
        make_source("doc-1", "ModelNow uses retrieval augmented generation.")
    ])
    assert result.context == (
        "[Source: doc-1]\n"
        "ModelNow uses retrieval augmented generation."
    )
    assert result.character_count == len(result.context)
    assert result.sources[0].document.document_id == "doc-1"
    print("PASS - SOURCE FORMATTING")


def test_character_budget() -> None:
    sources = [
        make_source("doc-1", "A" * 80),
        make_source("doc-2", "B" * 80, score=0.8, rank=2),
    ]
    result = ContextBuilder(max_chars=50).build(sources)

    assert len(result.context) <= 50
    assert result.character_count == len(result.context)
    assert result.truncated_count == 1
    assert result.omitted_count == 1
    print("PASS - CHARACTER BUDGET AND OMISSION")


def test_preserves_order_and_metadata() -> None:
    sources = [
        make_source("first", "First document.", score=0.99, rank=1),
        make_source("second", "Second document.", score=0.88, rank=2),
    ]
    result = ContextBuilder().build(sources)

    assert [item.document.document_id for item in result.sources] == [
        "first", "second"
    ]
    assert result.sources[0].score == 0.99
    assert result.sources[0].rank == 1
    assert result.sources[0].document.metadata["origin"] == "test"
    print("PASS - ORDER, SCORES, RANKS, AND METADATA")


def test_truncate_text() -> None:
    assert truncate_text("short text", 20) == "short text"
    assert len(truncate_text("one two three four", 10)) <= 10
    assert truncate_text("abcdef", 0) == ""
    print("PASS - TEXT TRUNCATION")


def test_empty_sources() -> None:
    result = ContextBuilder().build([])
    assert result.context == ""
    assert result.sources == ()
    assert result.character_count == 0
    assert result.truncated_count == 0
    assert result.omitted_count == 0
    print("PASS - EMPTY SOURCES")


def test_invalid_budget() -> None:
    try:
        ContextWindow(max_chars=0)
    except ValueError:
        pass
    else:
        raise AssertionError("A zero character budget must be rejected.")

    try:
        ContextWindow(max_chars=True)
    except TypeError:
        pass
    else:
        raise AssertionError("A boolean character budget must be rejected.")

    print("PASS - INVALID BUDGET VALIDATION")


def main() -> None:
    test_source_formatting()
    test_character_budget()
    test_preserves_order_and_metadata()
    test_truncate_text()
    test_empty_sources()
    test_invalid_budget()
    print("ALL CONTEXT BUILDER TESTS PASSED")


if __name__ == "__main__":
    main()
