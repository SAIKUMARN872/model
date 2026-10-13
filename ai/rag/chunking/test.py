from ai.rag.chunking import TextChunker, add_overlap, normalize_text, split_text


def main() -> None:
    assert normalize_text("  ModelNow \n AI   platform ") == "ModelNow AI platform"
    print("PASS - TEXT NORMALIZATION")

    text = " ".join(f"word{i}" for i in range(100))
    chunks = split_text(text, chunk_size=80, overlap=10)
    assert len(chunks) > 1
    assert all(len(chunk) <= 80 for chunk in chunks)
    print("PASS - CHUNK SIZE LIMIT")

    assert all(chunk.strip() for chunk in split_text("   "))
    assert split_text("") == []
    print("PASS - EMPTY INPUT")

    chunker = TextChunker(chunk_size=80, overlap=10)
    structured = chunker.split(text, document_id="doc-1")
    assert len(structured) > 1
    assert structured[0].chunk_id == "doc-1:0"
    assert structured[1].index == 1
    assert all(item.start_char <= item.end_char for item in structured)
    print("PASS - CHUNK METADATA")

    overlapped = add_overlap(["abcdefghij", "klmnopqrst"], overlap=3, chunk_size=20)
    assert overlapped[0] == "abcdefghij"
    assert overlapped[1].startswith("hij")
    print("PASS - OVERLAP COMBINATION")

    try:
        TextChunker(chunk_size=10, overlap=10)
    except ValueError:
        pass
    else:
        raise AssertionError("Invalid overlap should be rejected.")
    print("PASS - INVALID CONFIGURATION")

    print("PASS - RAG CHUNKING TEST")


if __name__ == "__main__":
    main()
