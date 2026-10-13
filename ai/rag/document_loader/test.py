import tempfile
from pathlib import Path

from ai.rag.document_loader import load_document, load_text_file
from ai.rag.document_loader.utils import (
    build_document_id,
    read_text_file,
    validate_file_path,
)


def run_test(name, function):
    try:
        function()
        print(f"PASS - {name}")
    except Exception as exc:
        print(f"FAIL - {name}: {exc}")
        raise


def test_load_text():
    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / "notes.txt"
        path.write_text("ModelNow RAG document", encoding="utf-8")
        document = load_text_file(path)
        assert document.text == "ModelNow RAG document"
        assert document.metadata["format"] == "txt"
        assert document.metadata["filename"] == "notes.txt"


def test_load_markdown():
    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / "notes.md"
        path.write_text("# Heading\n\n**Useful** content", encoding="utf-8")
        document = load_document(path)
        assert "Heading" in document.text
        assert "Useful" in document.text
        assert "**" not in document.text


def test_stable_document_id():
    assert build_document_id("source", "content") == build_document_id("source", "content")


def test_unique_content_id():
    assert build_document_id("source", "one") != build_document_id("source", "two")


def test_missing_file():
    with tempfile.TemporaryDirectory() as directory:
        try:
            load_text_file(Path(directory) / "missing.txt")
        except FileNotFoundError:
            return
        raise AssertionError("Missing file was accepted")


def test_empty_file():
    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / "empty.txt"
        path.write_text("", encoding="utf-8")
        try:
            load_text_file(path)
        except ValueError:
            return
        raise AssertionError("Empty file was accepted")


def test_unsupported_extension():
    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / "program.exe"
        path.write_text("not a document", encoding="utf-8")
        try:
            load_document(path)
        except ValueError:
            return
        raise AssertionError("Unsupported file type was accepted")


def test_file_size_limit():
    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / "large.txt"
        path.write_text("this content is too large", encoding="utf-8")
        try:
            validate_file_path(path, max_bytes=4)
        except ValueError:
            return
        raise AssertionError("Oversized file was accepted")


def test_directory_validation():
    with tempfile.TemporaryDirectory() as directory:
        try:
            validate_file_path(directory)
        except ValueError:
            return
        raise AssertionError("Directory was accepted as a file")


def test_utf8_reading():
    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / "unicode.txt"
        path.write_text("Hello नमस्ते", encoding="utf-8")
        assert "नमस्ते" in read_text_file(path)


def main():
    print("MODELNOW DOCUMENT LOADER TEST")
    run_test("TEXT DOCUMENT LOADING", test_load_text)
    run_test("MARKDOWN DOCUMENT LOADING", test_load_markdown)
    run_test("STABLE DOCUMENT IDS", test_stable_document_id)
    run_test("UNIQUE CONTENT IDS", test_unique_content_id)
    run_test("MISSING FILE VALIDATION", test_missing_file)
    run_test("EMPTY FILE VALIDATION", test_empty_file)
    run_test("UNSUPPORTED FILE TYPE VALIDATION", test_unsupported_extension)
    run_test("FILE SIZE LIMIT", test_file_size_limit)
    run_test("DIRECTORY PATH VALIDATION", test_directory_validation)
    run_test("UTF-8 TEXT READING", test_utf8_reading)
    print("PASS - DOCUMENT LOADER INTEGRATION TEST")


if __name__ == "__main__":
    main()
