from __future__ import annotations

from .chat_prompt import ChatMessage, ChatPromptTemplate
from .system_prompt import SystemPromptTemplate
from .template import PromptTemplate


def expect_exception(expected_type, operation):
    try:
        operation()
    except expected_type:
        return
    except Exception as exc:
        raise AssertionError(
            f"Expected {expected_type.__name__}, got {type(exc).__name__}: {exc}"
        ) from exc
    raise AssertionError(f"Expected {expected_type.__name__}, but no error was raised")


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def run_tests() -> tuple[int, int]:
    passed = 0
    failed = 0

    def check(name, operation):
        nonlocal passed, failed
        try:
            operation()
            print(f"PASS: {name}")
            passed += 1
        except Exception as exc:
            print(f"FAIL: {name} -> {type(exc).__name__}: {exc}")
            failed += 1

    template = PromptTemplate("Answer {question} using {context}.")
    check("Detect template variables", lambda: require(
        template.input_variables == ("question", "context"),
        f"Unexpected variables: {template.input_variables!r}",
    ))
    check("Render named variables", lambda: require(
        template.format(question="Why?", context="the report")
        == "Answer Why? using the report.",
        "Rendered prompt mismatch",
    ))
    check("Render using mapping", lambda: require(
        template.render({"question": "What?", "context": "notes"})
        == "Answer What? using notes.",
        "Mapping render mismatch",
    ))
    check("Preserve variable value types as strings", lambda: require(
        PromptTemplate("Count: {count}").format(count=3) == "Count: 3",
        "Integer variable rendering failed",
    ))
    check("Reject missing variables", lambda: expect_exception(
        ValueError, lambda: template.format(question="Why?")
    ))
    check("Reject unexpected variables", lambda: expect_exception(
        ValueError, lambda: template.format(question="Why?", context="notes", extra="x")
    ))
    check("Reject empty template", lambda: expect_exception(
        ValueError, lambda: PromptTemplate(" ")
    ))
    check("Reject non-string template", lambda: expect_exception(
        TypeError, lambda: PromptTemplate(123)
    ))
    check("Reject malformed placeholder", lambda: expect_exception(
        ValueError, lambda: PromptTemplate("Hello {name")
    ))
    check("Reject duplicate declared variables", lambda: expect_exception(
        ValueError, lambda: PromptTemplate("{name}", ["name", "name"])
    ))
    check("Reject unused declared variable", lambda: expect_exception(
        ValueError, lambda: PromptTemplate("Hello {name}", ["name", "unused"])
    ))
    check("Support repeated placeholders", lambda: require(
        PromptTemplate("{word} then {word}").format(word="go") == "go then go",
        "Repeated placeholder failed",
    ))
    check("Keep literal braces rejected unless valid placeholders", lambda: expect_exception(
        ValueError, lambda: PromptTemplate("Use { braces }")
    ))
    check("Create system prompt", lambda: require(
        SystemPromptTemplate("Be clear, {style}.").build(style="concise")
        == "Be clear, concise.",
        "System prompt rendering failed",
    ))
    check("Reject empty system prompt", lambda: expect_exception(
        ValueError, lambda: SystemPromptTemplate("")
    ))
    check("Create chat messages", lambda: require(
        ChatPromptTemplate([
            ChatMessage("system", "You are helpful."),
            ChatMessage("user", "Explain {topic}."),
        ]).format_messages(topic="RAG")
        == [
            {"role": "system", "content": "You are helpful."},
            {"role": "user", "content": "Explain RAG."},
        ],
        "Chat messages were not rendered in order",
    ))
    check("Preserve chat message order", lambda: require(
        [m["role"] for m in ChatPromptTemplate([
            {"role": "user", "content": "Hi"},
            {"role": "assistant", "content": "Hello"},
        ]).format_messages()] == ["user", "assistant"],
        "Chat order changed",
    ))
    check("Reject unsupported chat role", lambda: expect_exception(
        ValueError, lambda: ChatMessage("root", "Hello")
    ))
    check("Reject empty chat message list", lambda: expect_exception(
        ValueError, lambda: ChatPromptTemplate([])
    ))
    check("Reject missing chat variable", lambda: expect_exception(
        ValueError, lambda: ChatPromptTemplate([
            {"role": "user", "content": "Hello {name}"}
        ]).format_messages()
    ))
    check("Reject unexpected chat variable", lambda: expect_exception(
        ValueError, lambda: ChatPromptTemplate([
            {"role": "user", "content": "Hello"}
        ]).format_messages(name="Ada")
    ))
    check("Reject malformed chat message mapping", lambda: expect_exception(
        ValueError, lambda: ChatPromptTemplate([
            {"role": "user", "content": "Hello", "extra": "no"}
        ])
    ))
    check("Expose public package exports", lambda: require(
        all(name in __import__(
            "ai.prompt_management.templates", fromlist=["__all__"]
        ).__all__ for name in (
            "PromptTemplate", "SystemPromptTemplate",
            "ChatPromptTemplate", "ChatMessage",
        )),
        "Public exports missing",
    ))

    total = passed + failed
    print("=" * 68)
    print(f"REAL-OPERATION CHECKS PASSED: {passed}/{total}")
    print(f"REAL-OPERATION CHECKS FAILED: {failed}/{total}")
    print("PROMPT TEMPLATES REAL-OPERATION TEST: " + ("PASS" if failed == 0 else "FAIL"))
    return passed, failed


if __name__ == "__main__":
    _, failures = run_tests()
    raise SystemExit(1 if failures else 0)
