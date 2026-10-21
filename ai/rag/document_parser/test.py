from ai.rag.document_parser import (
    normalize_text,
    parse_document,
    parse_html,
    parse_markdown,
)


def run_test(name, function):
    try:
        function()
        print(f"PASS - {name}")
    except Exception as exc:
        print(f"FAIL - {name}: {exc}")
        raise


def test_text_normalization():
    assert normalize_text("  Hello  \r\n world \n\n\nagain ") == "Hello\nworld\n\nagain"


def test_html_visible_text():
    result = parse_html("<h1>Hello</h1><script>secret()</script><p>World</p>")
    assert "Hello" in result
    assert "World" in result
    assert "secret" not in result


def test_html_entities():
    assert "A & B" in parse_html("<p>A &amp; B</p>")


def test_markdown_formatting():
    result = parse_markdown("# Heading\n\nThis is **important**.")
    assert "Heading" in result
    assert "important" in result
    assert "**" not in result


def test_markdown_links():
    assert "ModelNow" in parse_markdown("[ModelNow](https://example.com)")


def test_plain_text_dispatch():
    assert parse_document("Plain text", ".txt") == "Plain text"


def test_html_dispatch():
    assert parse_document("<p>Visible</p>", "html") == "Visible"


def test_unsupported_type():
    try:
        parse_document("content", "exe")
    except ValueError:
        return
    raise AssertionError("Unsupported type was accepted")


def test_empty_content():
    try:
        parse_document("   ", "txt")
    except ValueError:
        return
    raise AssertionError("Empty content was accepted")


def test_invalid_input():
    try:
        parse_html(None)
    except TypeError:
        return
    raise AssertionError("Invalid input was accepted")


def main():
    print("MODELNOW DOCUMENT PARSER TEST")
    run_test("TEXT NORMALIZATION", test_text_normalization)
    run_test("HTML VISIBLE TEXT EXTRACTION", test_html_visible_text)
    run_test("HTML ENTITY DECODING", test_html_entities)
    run_test("MARKDOWN FORMATTING", test_markdown_formatting)
    run_test("MARKDOWN LINK EXTRACTION", test_markdown_links)
    run_test("PLAIN TEXT PARSING", test_plain_text_dispatch)
    run_test("HTML PARSER DISPATCH", test_html_dispatch)
    run_test("UNSUPPORTED TYPE VALIDATION", test_unsupported_type)
    run_test("EMPTY CONTENT VALIDATION", test_empty_content)
    run_test("INVALID INPUT VALIDATION", test_invalid_input)
    print("PASS - DOCUMENT PARSER INTEGRATION TEST")


if __name__ == "__main__":
    main()
