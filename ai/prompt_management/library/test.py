from __future__ import annotations

from .catalog import PromptLibraryCatalog
from .library import PromptLibrary
from .search import PromptLibrarySearch


def expect_exception(expected_type, operation):
    try:
        operation()
    except expected_type:
        return
    except Exception as exc:
        raise AssertionError(
            f"Expected {expected_type.__name__}, got {type(exc).__name__}"
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

    library = PromptLibrary()
    search = PromptLibrarySearch(library)
    catalog = PromptLibraryCatalog(library)
    state = {}

    def setup():
        state["a"] = library.create(
            "tenant-a",
            "Python Study Assistant",
            "Explain Python programming with examples",
            description="Helps learners understand Python",
            tags=["education", "python", "Python"],
            metadata={"level": "beginner", "settings": {"tone": "clear"}},
        )
        state["b"] = library.create(
            "tenant-a",
            "SQL Query Helper",
            "Generate and explain SQL queries",
            description="Database assistant",
            tags=["database", "sql"],
        )
        state["other"] = library.create(
            "tenant-b",
            "Private Python Prompt",
            "Private tenant instructions for Python",
            tags=["python"],
        )

    check("Create entries and retrieve saved state", lambda: (
        setup(),
        require(
            library.get("tenant-a", state["a"].entry_id).content
            == "Explain Python programming with examples",
            "Saved content does not match",
        ),
    ))

    check("List entries with tenant isolation", lambda: require(
        len(library.list_entries("tenant-a")) == 2
        and len(library.list_entries("tenant-b")) == 1,
        "Tenant list counts are incorrect",
    ))

    check("Filter entries by tag case-insensitively", lambda: require(
        [e.entry_id for e in library.list_entries("tenant-a", tag="PYTHON")]
        == [state["a"].entry_id],
        "Tag filter returned incorrect entries",
    ))

    check("Limit listed entries", lambda: require(
        len(library.list_entries("tenant-a", limit=1)) == 1,
        "List limit was not applied",
    ))

    check("Search prompt content case-insensitively", lambda: require(
        any(e.entry_id == state["a"].entry_id
            for e in search.search("tenant-a", "PYTHON PROGRAMMING")),
        "Content search missed the expected entry",
    ))

    check("Search prompt names and tags", lambda: require(
        any(e.entry_id == state["b"].entry_id
            for e in search.search("tenant-a", "SQL")),
        "Name or tag search missed the expected entry",
    ))

    check("Keep search results tenant-isolated", lambda: require(
        all(e.tenant_id == "tenant-a"
            for e in search.search("tenant-a", "Python")),
        "Search returned another tenant's entry",
    ))

    check("Return no results for unmatched query", lambda: require(
        search.search("tenant-a", "unmatched-zebra-term") == [],
        "Unexpected search result",
    ))

    check("Apply search result limit", lambda: require(
        len(search.search("tenant-a", "assistant", limit=1)) <= 1,
        "Search limit was not applied",
    ))

    def update_entry():
        original = state["a"]
        updated = library.update(
            "tenant-a",
            original.entry_id,
            content="Explain Python and show practical examples",
            tags=["python", "tutorial"],
        )
        saved = library.get("tenant-a", original.entry_id)
        require(updated.content == saved.content, "Updated content was not saved")
        require(saved.tags == ("python", "tutorial"), "Updated tags were not saved")

    check("Update entry and verify stored state", update_entry)

    check("Preserve fields omitted from update", lambda: require(
        library.get("tenant-a", state["a"].entry_id).name
        == "Python Study Assistant",
        "Existing name was lost",
    ))

    def input_metadata_is_isolated():
        original = state["a"]
        original.metadata["settings"]["tone"] = "changed"
        saved = library.get("tenant-a", original.entry_id)
        require(saved.metadata["settings"]["tone"] == "clear",
                "Input/returned metadata mutated stored state")

    check("Protect stored metadata from input-object mutation",
          input_metadata_is_isolated)

    def returned_metadata_is_isolated():
        entry = library.get("tenant-a", state["a"].entry_id)
        entry.metadata["settings"]["tone"] = "external mutation"
        require(
            library.get("tenant-a", state["a"].entry_id)
            .metadata["settings"]["tone"] == "clear",
            "Returned metadata mutation changed stored state",
        )

    check("Protect stored metadata from returned-object mutation",
          returned_metadata_is_isolated)

    check("Reject cross-tenant reads", lambda: expect_exception(
        KeyError, lambda: library.get("tenant-b", state["a"].entry_id)
    ))

    check("Reject cross-tenant updates", lambda: expect_exception(
        KeyError,
        lambda: library.update("tenant-b", state["a"].entry_id, name="Unauthorized"),
    ))

    def delete_entry():
        library.delete("tenant-a", state["b"].entry_id)
        require(library.count("tenant-a") == 1, "Tenant count after deletion is wrong")
        expect_exception(
            KeyError, lambda: library.get("tenant-a", state["b"].entry_id)
        )

    check("Delete entry and verify removal", delete_entry)

    check("Preserve another tenant's entries on deletion", lambda: require(
        library.get("tenant-b", state["other"].entry_id).name
        == "Private Python Prompt",
        "Other tenant's entry was affected",
    ))

    check("Reject non-JSON-compatible metadata", lambda: expect_exception(
        ValueError,
        lambda: library.create(
            "tenant-a", "Invalid metadata", "content", metadata={"bad": object()}
        ),
    ))

    check("Reject empty names", lambda: expect_exception(
        ValueError, lambda: library.create("tenant-a", "   ", "content")
    ))

    check("Reject empty content", lambda: expect_exception(
        ValueError, lambda: library.create("tenant-a", "Valid name", "   ")
    ))

    check("Reject invalid list limits", lambda: expect_exception(
        ValueError, lambda: library.list_entries("tenant-a", limit=0)
    ))

    check("Reject invalid search limits", lambda: expect_exception(
        ValueError, lambda: search.search("tenant-a", "python", limit=-1)
    ))

    check("Reject empty tenant identifiers", lambda: expect_exception(
        ValueError, lambda: library.list_entries(" ")
    ))

    check("Reject non-string search queries", lambda: expect_exception(
        TypeError, lambda: search.search("tenant-a", 123)
    ))

    def catalog_operations():
        entry = catalog.add(
            "tenant-c",
            "Catalog prompt",
            "Summarize a technical document",
            tags=["summary"],
        )
        require(catalog.get("tenant-c", entry.entry_id).name == "Catalog prompt",
                "Catalog retrieval failed")
        require(bool(catalog.search("tenant-c", "technical")),
                "Catalog search failed")
        require(catalog.remove("tenant-c", entry.entry_id),
                "Catalog removal returned false")
        expect_exception(KeyError, lambda: catalog.get("tenant-c", entry.entry_id))

    check("Catalog create, retrieve, search and remove", catalog_operations)

    total = passed + failed
    print("=" * 68)
    print(f"REAL-OPERATION CHECKS PASSED: {passed}/{total}")
    print(f"REAL-OPERATION CHECKS FAILED: {failed}/{total}")
    print("PROMPT LIBRARY REAL-OPERATION TEST: " + ("PASS" if failed == 0 else "FAIL"))
    return passed, failed


if __name__ == "__main__":
    _, failures = run_tests()
    raise SystemExit(1 if failures else 0)
