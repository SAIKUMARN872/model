"""Consolidated standalone tests for ModelNow ingestion."""

import tempfile
from pathlib import Path

from ai.vector_store.ingestion import (
    IngestionEmbeddingAdapter,
    SourceLoader,
    TextChunker,
    normalize_text,
    validate_source_id,
)


def main() -> None:
    normalized = normalize_text("  ModelNow  \r\n\r\n\r\n ingestion  ")
    assert normalized == "ModelNow\n\n ingestion"
    print("PASS: text normalization")

    assert validate_source_id(" source-1 ") == "source-1"
    print("PASS: source ID validation")

    loader = SourceLoader()
    inline = loader.load_text(
        "ModelNow is an AI execution platform.",
        source_id="test-source",
    )
    assert inline.source_id == "test-source"
    assert "AI execution platform" in inline.text
    print("PASS: inline text loading")

    with tempfile.TemporaryDirectory() as temp_dir:
        path = Path(temp_dir) / "knowledge.txt"
        path.write_text("Local knowledge for ModelNow.", encoding="utf-8")

        loaded = loader.load_file(path)
        assert loaded.source_name == "knowledge.txt"
        assert loaded.source_path is not None
        assert "Local knowledge" in loaded.text

        batch = loader.load_files([path])
        assert len(batch) == 1
        print("PASS: local file loading")

        unsupported = Path(temp_dir) / "image.png"
        unsupported.write_bytes(b"not an image")
        try:
            loader.load_file(unsupported)
        except ValueError:
            pass
        else:
            raise AssertionError("Unsupported file extension was accepted")
        print("PASS: unsupported file rejection")

    chunker = TextChunker(chunk_size=10, overlap=2)
    chunks = chunker.split("0123456789abcdefghij")
    assert len(chunks) == 3
    assert chunks[0].text == "0123456789"
    assert chunks[1].text.startswith("89")
    assert chunks[-1].end_char <= len("0123456789abcdefghij")
    print("PASS: chunking and overlap")

    assert TextChunker().split("   ") == []
    print("PASS: empty-content handling")

    adapter = IngestionEmbeddingAdapter(
        lambda texts: [[float(len(text)), 1.0] for text in texts]
    )
    vectors = adapter.embed(["alpha", "beta"])
    assert len(vectors) == 2
    assert len(vectors[0]) == 2
    print("PASS: injected embedding adapter")

    try:
        IngestionEmbeddingAdapter(lambda texts: [[1.0], [1.0, 2.0]]).embed(
            ["alpha", "beta"]
        )
    except ValueError:
        pass
    else:
        raise AssertionError("Inconsistent embedding dimensions were accepted")
    print("PASS: embedding validation")

    print("MODELNOW VECTOR INGESTION CONSOLIDATED TEST: PASS")


if __name__ == "__main__":
    main()
