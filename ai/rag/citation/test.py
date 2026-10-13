from __future__ import annotations

from ai.rag.models import RAGDocument, RetrievedDocument
from ai.rag.citation import (
    Citation,
    extract_citations,
    format_inline_citations,
    format_reference,
    format_reference_list,
    validate_citation_id,
)


def make_source(
    document_id: str,
    metadata: dict | None = None,
    score: float = 0.9,
) -> RetrievedDocument:
    return RetrievedDocument(
        document=RAGDocument(
            document_id=document_id,
            text="Example source text.",
            metadata=metadata or {},
        ),
        score=score,
        rank=1,
    )


def test_extract_citation_metadata() -> None:
    citations = extract_citations([
        make_source(
            "doc-1",
            {
                "title": "ModelNow Guide",
                "url": "https://example.com/guide",
                "page": 2,
            },
        )
    ])

    assert len(citations) == 1
    assert citations[0].citation_id == "doc-1"
    assert citations[0].title == "ModelNow Guide"
    assert citations[0].url == "https://example.com/guide"
    assert citations[0].page == 2
    print("PASS - CITATION METADATA EXTRACTION")


def test_duplicate_sources() -> None:
    citations = extract_citations([
        make_source("doc-1"),
        make_source("doc-1", {"title": "Duplicate"}),
        make_source("doc-2"),
    ])

    assert [item.document_id for item in citations] == ["doc-1", "doc-2"]
    print("PASS - DUPLICATE SOURCE HANDLING")


def test_inline_and_reference_formatting() -> None:
    citations = extract_citations([
        make_source("doc-1", {"title": "First source"}),
        make_source("doc-2", {"source": "second.pdf", "page": 3}),
    ])

    assert format_inline_citations(citations) == "[doc-1] [doc-2]"

    references = format_reference_list(citations)
    assert "[doc-1] — First source" in references
    assert "[doc-2] — second.pdf" in references
    assert "Page: 3" in references
    print("PASS - INLINE AND REFERENCE FORMATTING")


def test_single_reference() -> None:
    citation = Citation(
        citation_id="guide",
        document_id="guide",
        title="Guide",
        url="https://example.com",
    )
    result = format_reference(citation)

    assert result == "[guide] — Guide — URL: https://example.com"
    print("PASS - SINGLE REFERENCE FORMATTING")


def test_id_validation() -> None:
    assert validate_citation_id(" doc-1 ") == "doc-1"

    for invalid in ("", "bad id", "bad/id"):
        try:
            validate_citation_id(invalid)
        except ValueError:
            continue
        raise AssertionError(f"Expected invalid citation ID: {invalid!r}")

    try:
        validate_citation_id(123)  # type: ignore[arg-type]
    except TypeError:
        pass
    else:
        raise AssertionError("A non-string citation ID should be rejected.")

    print("PASS - CITATION ID VALIDATION")


def test_missing_optional_metadata() -> None:
    citations = extract_citations([make_source("document-123")])
    citation = citations[0]

    assert citation.title is None
    assert citation.source is None
    assert citation.url is None
    assert format_reference(citation) == (
        "[document-123] — document-123"
    )
    print("PASS - OPTIONAL METADATA FALLBACK")


def main() -> None:
    test_extract_citation_metadata()
    test_duplicate_sources()
    test_inline_and_reference_formatting()
    test_single_reference()
    test_id_validation()
    test_missing_optional_metadata()
    print("ALL CITATION TESTS PASSED")


if __name__ == "__main__":
    main()
