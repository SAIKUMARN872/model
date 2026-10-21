from __future__ import annotations

from .injector import VariableInjector
from .resolver import VariableResolver
from .utils import find_placeholders
from .variables import PromptVariable, VariableSet


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

    topic = PromptVariable("topic")
    count = PromptVariable("count", expected_type=int)
    language = PromptVariable("language", required=False, default="English")
    variables = VariableSet([topic, count, language])
    resolver = VariableResolver(variables)
    injector = VariableInjector(resolver)

    check("Create variable definition", lambda: require(
        topic.name == "topic" and topic.required,
        "Variable definition mismatch",
    ))
    check("Preserve variable insertion order", lambda: require(
        variables.names() == ("topic", "count", "language"),
        "Variable order changed",
    ))
    check("Retrieve variable by name", lambda: require(
        variables.get("count") is count,
        "Variable lookup failed",
    ))
    check("Reject duplicate variable definitions", lambda: expect_exception(
        ValueError, lambda: VariableSet([PromptVariable("x"), PromptVariable("x")])
    ))
    check("Reject invalid variable name", lambda: expect_exception(
        ValueError, lambda: PromptVariable("not valid")
    ))
    check("Reject required variable with default", lambda: expect_exception(
        ValueError, lambda: PromptVariable("x", required=True, default="value")
    ))
    check("Validate variable value type", lambda: expect_exception(
        TypeError, lambda: count.validate_value("three")
    ))
    check("Do not treat bool as integer", lambda: expect_exception(
        TypeError, lambda: count.validate_value(True)
    ))
    check("Find unique template placeholders", lambda: require(
        find_placeholders("{topic} and {count} then {topic}") == ("topic", "count"),
        "Placeholder parsing mismatch",
    ))
    check("Reject malformed placeholder", lambda: expect_exception(
        ValueError, lambda: find_placeholders("Hello {topic")
    ))
    check("Resolve supplied values", lambda: require(
        resolver.resolve({"topic": "RAG", "count": 3}) ==
        {"topic": "RAG", "count": 3, "language": "English"},
        "Resolved values mismatch",
    ))
    check("Apply optional default", lambda: require(
        resolver.resolve({"topic": "AI", "count": 1})["language"] == "English",
        "Default not applied",
    ))
    check("Reject missing required value", lambda: expect_exception(
        ValueError, lambda: resolver.resolve({"count": 1})
    ))
    check("Reject unknown context value in strict mode", lambda: expect_exception(
        ValueError, lambda: resolver.resolve(
            {"topic": "AI", "count": 1, "extra": "x"}
        )
    ))
    check("Allow unknown context value in non-strict mode", lambda: require(
        resolver.resolve(
            {"topic": "AI", "count": 1, "extra": "x"}, strict=False
        )["extra"] == "x",
        "Non-strict context value was not retained",
    ))
    check("Inject resolved variables", lambda: require(
        injector.inject(
            "Explain {topic} in {language}; examples: {count}.",
            {"topic": "RAG", "count": 2},
        ) == "Explain RAG in English; examples: 2.",
        "Variable injection mismatch",
    ))
    check("Reject missing injection value", lambda: expect_exception(
        ValueError, lambda: injector.inject("Hello {name}")
    ))
    check("Support direct injection without definitions", lambda: require(
        VariableInjector().inject("Hello {name}", {"name": "Ada"}) == "Hello Ada",
        "Direct injection failed",
    ))
    check("Do not recursively expand injected braces", lambda: require(
        VariableInjector().inject("Value: {value}", {"value": "{other}"})
        == "Value: {other}",
        "Injected value was recursively expanded",
    ))
    check("Reject malformed injection template", lambda: expect_exception(
        ValueError, lambda: VariableInjector().inject("Broken {name")
    ))
    check("Reject invalid context type", lambda: expect_exception(
        TypeError, lambda: resolver.resolve(["not", "a", "mapping"])
    ))
    check("Expose public package exports", lambda: require(
        all(name in __import__(
            "ai.prompt_management.variables", fromlist=["__all__"]
        ).__all__ for name in (
            "PromptVariable", "VariableSet", "VariableResolver", "VariableInjector"
        )),
        "Public exports missing",
    ))

    total = passed + failed
    print("=" * 68)
    print(f"REAL-OPERATION CHECKS PASSED: {passed}/{total}")
    print(f"REAL-OPERATION CHECKS FAILED: {failed}/{total}")
    print("PROMPT VARIABLES REAL-OPERATION TEST: " + ("PASS" if failed == 0 else "FAIL"))
    return passed, failed


if __name__ == "__main__":
    _, failures = run_tests()
    raise SystemExit(1 if failures else 0)
