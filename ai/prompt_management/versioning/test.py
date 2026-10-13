from __future__ import annotations

from .history import VersionHistory
from .manager import PromptVersionManager
from .utils import (
    validate_content,
    validate_metadata,
    validate_prompt_id,
    validate_version_number,
)
from .versions import PromptVersion


def run_tests() -> tuple[int, int]:
    passed = 0
    failed = 0

    def check(name: str, operation) -> None:
        nonlocal passed, failed
        try:
            operation()
            passed += 1
            print(f"PASS: {name}")
        except Exception as exc:
            failed += 1
            print(f"FAIL: {name} -> {type(exc).__name__}: {exc}")

    def expect_error(error_type, operation) -> None:
        try:
            operation()
        except error_type:
            return
        raise AssertionError(f"Expected {error_type.__name__}")

    manager = PromptVersionManager()

    def create_two_versions():
        first = manager.create_version(
            "prompt-a", "Original prompt", change_note="Initial",
            metadata={"owner": "team-a"},
        )
        second = manager.create_version(
            "prompt-a", "Updated prompt", change_note="Clarified",
        )
        assert first.version == 1 and second.version == 2

    check("Validate prompt ID", lambda: (
        validate_prompt_id(" prompt-a ") == "prompt-a"
        or (_ for _ in ()).throw(AssertionError("ID was not normalized"))
    ))
    check("Reject empty prompt ID", lambda: expect_error(
        ValueError, lambda: validate_prompt_id("   ")
    ))
    check("Reject non-string prompt ID", lambda: expect_error(
        TypeError, lambda: validate_prompt_id(123)
    ))
    check("Validate prompt content", lambda: (
        validate_content("hello") == "hello"
        or (_ for _ in ()).throw(AssertionError("Content changed"))
    ))
    check("Reject non-string content", lambda: expect_error(
        TypeError, lambda: validate_content(None)
    ))
    check("Validate positive version number", lambda: (
        validate_version_number(1) == 1
        or (_ for _ in ()).throw(AssertionError("Version changed"))
    ))
    check("Reject zero version number", lambda: expect_error(
        ValueError, lambda: validate_version_number(0)
    ))
    check("Reject boolean version number", lambda: expect_error(
        TypeError, lambda: validate_version_number(True)
    ))
    check("Create sequential versions", create_two_versions)
    check("Retrieve exact version", lambda: (
        manager.get_version("prompt-a", 1).content == "Original prompt"
        or (_ for _ in ()).throw(AssertionError("Wrong version returned"))
    ))
    check("Retrieve latest version", lambda: (
        manager.latest_version("prompt-a").version == 2
        or (_ for _ in ()).throw(AssertionError("Wrong latest version"))
    ))
    check("List versions in order", lambda: (
        [v.version for v in manager.list_versions("prompt-a")] == [1, 2]
        or (_ for _ in ()).throw(AssertionError("Incorrect history order"))
    ))
    check("Reject unknown prompt", lambda: expect_error(
        KeyError, lambda: manager.get_version("unknown", 1)
    ))
    check("Reject nonexistent version", lambda: expect_error(
        KeyError, lambda: manager.get_version("prompt-a", 99)
    ))
    check("Return empty history for unknown prompt", lambda: (
        manager.list_versions("never-created") == ()
        or (_ for _ in ()).throw(AssertionError("History should be empty"))
    ))
    check("Keep prompts isolated", lambda: (
        manager.create_version("prompt-b", "Separate").version == 1
        and len(manager.list_versions("prompt-b")) == 1
        and len(manager.list_versions("prompt-a")) == 2
        or (_ for _ in ()).throw(AssertionError("Prompt histories mixed"))
    ))
    check("Preserve change note", lambda: (
        manager.get_version("prompt-a", 1).change_note == "Initial"
        or (_ for _ in ()).throw(AssertionError("Change note missing"))
    ))
    check("Copy input metadata", lambda: _test_metadata_copy())
    check("Expose metadata as read-only", lambda: _test_metadata_readonly())
    check("Restore old content as a new version", lambda: _test_restore())
    check("Record restore provenance in note", _test_restore_note)
    check("Reject restore from missing version", lambda: expect_error(
        KeyError, lambda: manager.restore_version("prompt-a", 50)
    ))
    check("Reject metadata that is not a mapping", lambda: expect_error(
        TypeError, lambda: validate_metadata(["not", "a", "mapping"])
    ))
    check("Reject non-string metadata keys", lambda: expect_error(
        TypeError, lambda: validate_metadata({1: "invalid"})
    ))
    check("Expose public package exports", lambda: _test_exports())

    print("=" * 68)
    print(f"REAL-OPERATION CHECKS PASSED: {passed}/{passed + failed}")
    print(f"REAL-OPERATION CHECKS FAILED: {failed}/{passed + failed}")
    print("PROMPT VERSIONING REAL-OPERATION TEST: " + ("PASS" if failed == 0 else "FAIL"))
    return passed, failed


def _test_metadata_copy():
    source = {"labels": ["original"]}
    manager = PromptVersionManager()
    record = manager.create_version("metadata-prompt", "text", metadata=source)
    source["labels"].append("changed")
    assert record.metadata["labels"] == ["original"]


def _test_metadata_readonly():
    record = PromptVersion.create("readonly", 1, "text", metadata={"owner": "team"})

    def attempt_assignment():
        record.metadata["owner"] = "other"

    expect_error(TypeError, attempt_assignment)
    assert record.metadata["owner"] == "team"


def _test_restore():
    manager = PromptVersionManager()
    manager.create_version("restore-prompt", "old")
    manager.create_version("restore-prompt", "new")
    restored = manager.restore_version("restore-prompt", 1)
    assert restored.version == 3
    assert restored.content == "old"
    assert [v.content for v in manager.list_versions("restore-prompt")] == [
        "old", "new", "old"
    ]


def _test_restore_note():
    manager = PromptVersionManager()
    manager.create_version("restore-note-prompt", "first")
    manager.create_version("restore-note-prompt", "second")
    restored = manager.restore_version("restore-note-prompt", 1)
    assert restored.change_note == "Restored from version 1"


def _test_exports():
    from . import (
        PromptVersion,
        PromptVersionManager as ExportedManager,
        VersionHistory as ExportedHistory,
        validate_prompt_id as exported_validate,
    )
    assert PromptVersion is not None
    assert ExportedManager is PromptVersionManager
    assert ExportedHistory is VersionHistory
    assert exported_validate("export-check") == "export-check"


def expect_error(error_type, operation):
    try:
        operation()
    except error_type:
        return
    raise AssertionError(f"Expected {error_type.__name__}")


if __name__ == "__main__":
    _, failures = run_tests()
    raise SystemExit(1 if failures else 0)
