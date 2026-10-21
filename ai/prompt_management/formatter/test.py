"""Real-operation tests for ModelNow prompt formatters."""

import json

from ai.prompt_management.formatter import (
    JsonFormatter,
    MarkdownFormatter,
    PromptFormatter,
    format_prompt,
)
from ai.prompt_management.formatter.utils import (
    normalize_data,
    require_text,
    validate_format,
)


passed = 0
failed = 0


def check(name, operation):
    global passed, failed
    try:
        operation()
        passed += 1
        print(f"PASS: {name}")
    except Exception as exc:
        failed += 1
        print(f"FAIL: {name}")
        print(f"      {type(exc).__name__}: {exc}")


def expect_error(error_type, operation):
    try:
        operation()
    except error_type:
        return
    except Exception as exc:
        raise AssertionError(
            f"Expected {error_type.__name__}, got {type(exc).__name__}: {exc}"
        ) from exc
    raise AssertionError(f"Expected {error_type.__name__}, but no error occurred.")


def main():
    formatter = PromptFormatter()
    json_formatter = JsonFormatter()
    markdown_formatter = MarkdownFormatter()

    sample = {
        "task": "Summarize",
        "language": "తెలుగు",
        "options": ["concise", "accurate"],
        "settings": {"temperature": 0.2, "enabled": True},
    }

    def json_round_trip():
        encoded = json_formatter.format(sample)
        decoded = json.loads(encoded)
        assert decoded == sample
        assert "తెలుగు" in encoded

    def json_parser_rejects_invalid_input():
        expect_error(ValueError, lambda: json_formatter.parse("{invalid json"))

    def markdown_renders_nested_sections():
        output = markdown_formatter.format(sample)
        assert "## task" in output
        assert "## settings" in output
        assert "temperature" in output
        assert "- concise" in output
        assert "తెలుగు" in output

    def markdown_formats_sections():
        output = markdown_formatter.format_sections(
            {"Instructions": "Be accurate.", "Examples": ["One", "Two"]}
        )
        assert "## Instructions" in output
        assert "Be accurate." in output
        assert "- One" in output
        assert "- Two" in output

    def unified_json_dispatch():
        output = formatter.format(sample, "json")
        assert json.loads(output) == sample

    def unified_markdown_dispatch():
        output = formatter.format(sample, "markdown")
        assert output.startswith("## task")

    def text_format_preserves_content():
        prompt = "Explain ModelNow RAG and routing."
        assert formatter.format(prompt, "text") == prompt
        assert formatter.format_prompt(prompt) == prompt

    def convenience_function_formats_json():
        output = format_prompt({"ok": True}, "json")
        assert json.loads(output) == {"ok": True}

    def format_name_is_normalized():
        assert validate_format(" JSON ") == "json"
        assert formatter.format("hello", " TEXT ") == "hello"

    def unsupported_format_is_rejected():
        expect_error(ValueError, lambda: formatter.format("hello", "xml"))

    def unsupported_object_is_rejected():
        expect_error(TypeError, lambda: normalize_data(object()))

    def non_string_mapping_key_is_rejected():
        expect_error(TypeError, lambda: normalize_data({1: "invalid"}))

    def non_finite_number_is_rejected():
        expect_error(ValueError, lambda: normalize_data(float("nan")))

    def invalid_json_indent_is_rejected():
        expect_error(ValueError, lambda: json_formatter.format({"x": 1}, indent=-1))
        expect_error(ValueError, lambda: json_formatter.format({"x": 1}, indent=True))

    def invalid_json_content_is_rejected():
        expect_error(ValueError, lambda: json_formatter.parse("not-json"))

    def empty_prompt_is_rejected():
        expect_error(ValueError, lambda: formatter.format_prompt("   "))

    def non_string_prompt_is_rejected():
        expect_error(TypeError, lambda: formatter.format_prompt(123))

    def empty_sections_are_rejected():
        expect_error(ValueError, lambda: markdown_formatter.format_sections({}))

    def text_validation_works():
        assert require_text("ModelNow") == "ModelNow"
        expect_error(ValueError, lambda: require_text("   "))
        expect_error(TypeError, lambda: require_text(123))

    def normalization_copies_nested_data():
        source = {"items": [1, {"value": "original"}]}
        normalized = normalize_data(source)
        normalized["items"][1]["value"] = "changed"
        assert source["items"][1]["value"] == "original"

    checks = [
        ("JSON serialization and round-trip", json_round_trip),
        ("JSON parser rejects malformed input", json_parser_rejects_invalid_input),
        ("Markdown renders nested structured data", markdown_renders_nested_sections),
        ("Markdown renders named sections and lists", markdown_formats_sections),
        ("Unified formatter dispatches JSON", unified_json_dispatch),
        ("Unified formatter dispatches Markdown", unified_markdown_dispatch),
        ("Text formatting preserves prompt content", text_format_preserves_content),
        ("Convenience function formats structured data", convenience_function_formats_json),
        ("Format names are normalized", format_name_is_normalized),
        ("Unsupported formats are rejected", unsupported_format_is_rejected),
        ("Unsupported objects are rejected", unsupported_object_is_rejected),
        ("Non-string mapping keys are rejected", non_string_mapping_key_is_rejected),
        ("Non-finite numbers are rejected", non_finite_number_is_rejected),
        ("Invalid JSON indentation is rejected", invalid_json_indent_is_rejected),
        ("Malformed JSON input is rejected", invalid_json_content_is_rejected),
        ("Empty prompts are rejected", empty_prompt_is_rejected),
        ("Non-string prompts are rejected", non_string_prompt_is_rejected),
        ("Empty Markdown sections are rejected", empty_sections_are_rejected),
        ("Text validation handles valid and invalid input", text_validation_works),
        ("Normalization isolates nested source data", normalization_copies_nested_data),
    ]

    print("=" * 68)
    print("MODELNOW PROMPT FORMATTER REAL-OPERATION TEST")
    print("=" * 68)

    for name, operation in checks:
        check(name, operation)

    print("=" * 68)
    print(f"REAL-OPERATION CHECKS PASSED: {passed}/{len(checks)}")
    print(f"REAL-OPERATION CHECKS FAILED: {failed}/{len(checks)}")

    if failed:
        print("PROMPT FORMATTER REAL-OPERATION TEST: FAIL")
        raise SystemExit(1)

    print("PROMPT FORMATTER REAL-OPERATION TEST: PASS")


if __name__ == "__main__":
    main()
