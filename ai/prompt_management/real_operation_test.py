from __future__ import annotations

from collections.abc import Callable
from typing import Any

from ai.prompt_management.constants import PromptStatus
from ai.prompt_management.engine import PromptManagementEngine
from ai.prompt_management.exceptions import (
    MissingPromptVariablesError,
    PromptConflictError,
    PromptNotFoundError,
    PromptValidationError,
)
from ai.prompt_management.models import PromptVariable
from ai.prompt_management.schemas import CreatePromptRequest


passed = 0
failed = 0


def check(name: str, operation: Callable[[], Any]) -> None:
    global passed, failed
    try:
        operation()
        passed += 1
        print(f"PASS: {name}")
    except Exception as exc:
        failed += 1
        print(f"FAIL: {name}")
        print(f"      {type(exc).__name__}: {exc}")


def expect_error(
    error_type: type[Exception],
    operation: Callable[[], Any],
) -> None:
    try:
        operation()
    except error_type:
        return
    except Exception as exc:
        raise AssertionError(
            f"Expected {error_type.__name__}, got "
            f"{type(exc).__name__}: {exc}"
        ) from exc
    raise AssertionError(f"Expected {error_type.__name__}, but no exception was raised.")


def create_engine_and_prompt(
    tenant_id: str = "real-test-tenant-a",
    name: str = "real-operation-welcome",
):
    engine = PromptManagementEngine()
    prompt = engine.create(
        CreatePromptRequest(
            tenant_id=tenant_id,
            name=name,
            template="Hello {{name}}. Task: {{task}}",
            variables=(
                PromptVariable("name"),
                PromptVariable("task", required=False, default="ModelNow testing"),
            ),
            metadata={"purpose": "real-operation-test"},
        )
    )
    return engine, prompt


def test_create_and_retrieve():
    engine, created = create_engine_and_prompt()
    saved = engine.get(created.tenant_id, created.prompt_id)
    assert saved.prompt_id == created.prompt_id
    assert saved.tenant_id == "real-test-tenant-a"
    assert saved.name == "real-operation-welcome"
    assert saved.template == "Hello {{name}}. Task: {{task}}"
    assert saved.status == PromptStatus.DRAFT
    assert saved.version == 1


def test_list_tenant_prompts():
    engine, prompt_a = create_engine_and_prompt()
    prompt_b = engine.create(
        CreatePromptRequest(
            tenant_id="real-test-tenant-b",
            name="another-tenant-prompt",
            template="Private prompt",
        )
    )
    tenant_a = engine.list("real-test-tenant-a")
    tenant_b = engine.list("real-test-tenant-b")
    assert [p.prompt_id for p in tenant_a] == [prompt_a.prompt_id]
    assert all(p.tenant_id == "real-test-tenant-a" for p in tenant_a)
    assert [p.prompt_id for p in tenant_b] == [prompt_b.prompt_id]
    assert all(p.tenant_id == "real-test-tenant-b" for p in tenant_b)


def test_render_values_and_default():
    engine, prompt = create_engine_and_prompt()
    result = engine.render(prompt.tenant_id, prompt.prompt_id, {"name": "ModelNow"})
    assert result == "Hello ModelNow. Task: ModelNow testing"


def test_required_variable_rejected():
    engine, prompt = create_engine_and_prompt()
    expect_error(
        MissingPromptVariablesError,
        lambda: engine.render(prompt.tenant_id, prompt.prompt_id),
    )


def test_missing_variables_are_reported():
    engine, prompt = create_engine_and_prompt()
    try:
        engine.render(prompt.tenant_id, prompt.prompt_id)
    except MissingPromptVariablesError as exc:
        assert exc.missing == ("name",)
    else:
        raise AssertionError("Missing required variable was accepted")


def test_draft_update_persists():
    engine, prompt = create_engine_and_prompt()
    updated = engine.update_draft(
        prompt.tenant_id,
        prompt.prompt_id,
        template="Welcome, {{name}}!",
    )
    saved = engine.get(prompt.tenant_id, prompt.prompt_id)
    assert updated.template == "Welcome, {{name}}!"
    assert saved.template == "Welcome, {{name}}!"
    assert saved.version == prompt.version + 1
    assert engine.render(
        prompt.tenant_id, prompt.prompt_id, {"name": "ModelNow"}
    ) == "Welcome, ModelNow!"


def test_update_preserves_unspecified_fields():
    engine, prompt = create_engine_and_prompt()
    updated = engine.update_draft(
        prompt.tenant_id,
        prompt.prompt_id,
        template="Hi {{name}}!",
    )
    assert updated.description == prompt.description
    assert updated.variables == prompt.variables
    assert updated.metadata == prompt.metadata


def test_update_rejects_undeclared_variable():
    engine, prompt = create_engine_and_prompt()
    expect_error(
        PromptValidationError,
        lambda: engine.update_draft(
            prompt.tenant_id,
            prompt.prompt_id,
            template="Hi {{unknown}}!",
        ),
    )


def test_publish_persists_snapshot():
    engine, prompt = create_engine_and_prompt()
    published = engine.publish(
        prompt.tenant_id, prompt.prompt_id, "Initial release"
    )
    saved = engine.get(prompt.tenant_id, prompt.prompt_id)
    assert published.status == PromptStatus.PUBLISHED
    assert saved.status == PromptStatus.PUBLISHED
    assert saved.published_version == prompt.version
    assert len(saved.versions) == 1
    assert saved.versions[0].template == prompt.template
    assert saved.versions[0].changelog == "Initial release"
    assert saved.versions[0].published_at is not None


def test_published_prompt_renders_snapshot():
    engine, prompt = create_engine_and_prompt()
    engine.publish(prompt.tenant_id, prompt.prompt_id, "Release")
    result = engine.render(
        prompt.tenant_id, prompt.prompt_id, {"name": "ModelNow"}
    )
    assert result == "Hello ModelNow. Task: ModelNow testing"


def test_published_prompt_can_render_explicit_version():
    engine, prompt = create_engine_and_prompt()
    engine.publish(prompt.tenant_id, prompt.prompt_id, "Version one")
    result = engine.render(
        prompt.tenant_id,
        prompt.prompt_id,
        {"name": "ModelNow"},
        version=prompt.version,
    )
    assert result == "Hello ModelNow. Task: ModelNow testing"


def test_published_prompt_cannot_be_updated():
    engine, prompt = create_engine_and_prompt()
    engine.publish(prompt.tenant_id, prompt.prompt_id, "Release")
    expect_error(
        PromptConflictError,
        lambda: engine.update_draft(
            prompt.tenant_id,
            prompt.prompt_id,
            template="Changed {{name}}",
        ),
    )
    assert engine.get(prompt.tenant_id, prompt.prompt_id).template == prompt.template


def test_republishing_is_rejected():
    engine, prompt = create_engine_and_prompt()
    engine.publish(prompt.tenant_id, prompt.prompt_id, "First release")
    expect_error(
        PromptConflictError,
        lambda: engine.publish(
            prompt.tenant_id, prompt.prompt_id, "Second release"
        ),
    )


def test_cross_tenant_read_is_rejected():
    engine, prompt = create_engine_and_prompt()
    expect_error(
        PromptNotFoundError,
        lambda: engine.get("real-test-tenant-b", prompt.prompt_id),
    )


def test_cross_tenant_render_is_rejected():
    engine, prompt = create_engine_and_prompt()
    expect_error(
        PromptNotFoundError,
        lambda: engine.render(
            "real-test-tenant-b", prompt.prompt_id, {"name": "Unauthorized"}
        ),
    )


def test_duplicate_name_in_same_tenant_is_rejected():
    engine, _ = create_engine_and_prompt()
    expect_error(
        PromptConflictError,
        lambda: engine.create(
            CreatePromptRequest(
                tenant_id="real-test-tenant-a",
                name="real-operation-welcome",
                template="A different prompt",
            )
        ),
    )


def test_same_name_in_different_tenants_is_allowed():
    engine, first = create_engine_and_prompt()
    second = engine.create(
        CreatePromptRequest(
            tenant_id="real-test-tenant-b",
            name=first.name,
            template="A separate tenant prompt",
        )
    )
    assert first.name == second.name
    assert first.prompt_id != second.prompt_id
    assert first.tenant_id != second.tenant_id


def test_unknown_prompt_is_rejected():
    engine = PromptManagementEngine()
    expect_error(
        PromptNotFoundError,
        lambda: engine.get("real-test-tenant-a", "missing-prompt-id"),
    )


def test_unknown_template_variable_is_rejected():
    engine = PromptManagementEngine()
    expect_error(
        PromptValidationError,
        lambda: engine.create(
            CreatePromptRequest(
                tenant_id="real-test-tenant-a",
                name="invalid-real-test-prompt",
                template="Hello {{unknown}}",
                variables=(PromptVariable("name"),),
            )
        ),
    )


def test_unknown_input_variable_is_rejected():
    engine, prompt = create_engine_and_prompt()
    expect_error(
        PromptValidationError,
        lambda: engine.render(
            prompt.tenant_id,
            prompt.prompt_id,
            {"name": "ModelNow", "unexpected": "value"},
        ),
    )


def test_non_scalar_variable_is_rejected():
    engine, prompt = create_engine_and_prompt()
    expect_error(
        PromptValidationError,
        lambda: engine.render(
            prompt.tenant_id,
            prompt.prompt_id,
            {"name": ["not", "a", "scalar"]},
        ),
    )


def test_values_are_not_recursively_expanded():
    engine, prompt = create_engine_and_prompt()
    result = engine.render(
        prompt.tenant_id, prompt.prompt_id, {"name": "{{task}}"}
    )
    assert result == "Hello {{task}}. Task: ModelNow testing"


def test_archive_persists():
    engine, prompt = create_engine_and_prompt()
    archived = engine.archive(prompt.tenant_id, prompt.prompt_id)
    saved = engine.get(prompt.tenant_id, prompt.prompt_id)
    assert archived.status == PromptStatus.ARCHIVED
    assert saved.status == PromptStatus.ARCHIVED


def test_archived_prompt_cannot_be_rendered():
    engine, prompt = create_engine_and_prompt()
    engine.archive(prompt.tenant_id, prompt.prompt_id)
    expect_error(
        PromptConflictError,
        lambda: engine.render(
            prompt.tenant_id, prompt.prompt_id, {"name": "ModelNow"}
        ),
    )


def test_archived_prompt_cannot_be_edited():
    engine, prompt = create_engine_and_prompt()
    engine.archive(prompt.tenant_id, prompt.prompt_id)
    expect_error(
        PromptConflictError,
        lambda: engine.update_draft(
            prompt.tenant_id,
            prompt.prompt_id,
            template="Changed {{name}}",
        ),
    )


def test_archived_prompt_cannot_be_published():
    engine, prompt = create_engine_and_prompt()
    engine.archive(prompt.tenant_id, prompt.prompt_id)
    expect_error(
        PromptConflictError,
        lambda: engine.publish(prompt.tenant_id, prompt.prompt_id, "Release"),
    )


def test_archive_is_idempotent():
    engine, prompt = create_engine_and_prompt()
    first = engine.archive(prompt.tenant_id, prompt.prompt_id)
    second = engine.archive(prompt.tenant_id, prompt.prompt_id)
    assert first.status == second.status == PromptStatus.ARCHIVED


def test_template_requires_nonempty_content():
    engine = PromptManagementEngine()
    expect_error(
        PromptValidationError,
        lambda: engine.create(
            CreatePromptRequest(
                tenant_id="real-test-tenant-a",
                name="empty-template",
                template="   ",
            )
        ),
    )


def test_duplicate_variable_declarations_are_rejected():
    engine = PromptManagementEngine()
    expect_error(
        PromptValidationError,
        lambda: engine.create(
            CreatePromptRequest(
                tenant_id="real-test-tenant-a",
                name="duplicate-variables",
                template="{{name}}",
                variables=(PromptVariable("name"), PromptVariable("name")),
            )
        ),
    )


def test_list_is_sorted_by_name():
    engine = PromptManagementEngine()
    engine.create(CreatePromptRequest(
        tenant_id="sort-tenant", name="Zebra", template="z"
    ))
    engine.create(CreatePromptRequest(
        tenant_id="sort-tenant", name="alpha", template="a"
    ))
    names = [p.name for p in engine.list("sort-tenant")]
    assert names == ["alpha", "Zebra"]


def main() -> int:
    global passed, failed
    print("=" * 68)
    print("MODELNOW PROMPT MANAGEMENT REAL-OPERATION TEST")
    print("=" * 68)

    checks = [
        ("Create prompt and retrieve saved state", test_create_and_retrieve),
        ("List prompts with tenant isolation", test_list_tenant_prompts),
        ("Render values and default variables", test_render_values_and_default),
        ("Reject missing required variables", test_required_variable_rejected),
        ("Report exact missing variable names", test_missing_variables_are_reported),
        ("Update draft and verify saved state", test_draft_update_persists),
        ("Preserve fields omitted from draft update", test_update_preserves_unspecified_fields),
        ("Reject undeclared variables in draft updates", test_update_rejects_undeclared_variable),
        ("Publish and verify version snapshot", test_publish_persists_snapshot),
        ("Render the published snapshot", test_published_prompt_renders_snapshot),
        ("Render an explicit published version", test_published_prompt_can_render_explicit_version),
        ("Reject edits to published prompts", test_published_prompt_cannot_be_updated),
        ("Reject republishing an already published prompt", test_republishing_is_rejected),
        ("Reject cross-tenant reads", test_cross_tenant_read_is_rejected),
        ("Reject cross-tenant rendering", test_cross_tenant_render_is_rejected),
        ("Reject duplicate names within a tenant", test_duplicate_name_in_same_tenant_is_rejected),
        ("Allow same prompt name across tenants", test_same_name_in_different_tenants_is_allowed),
        ("Reject nonexistent prompt IDs", test_unknown_prompt_is_rejected),
        ("Reject undeclared template variables", test_unknown_template_variable_is_rejected),
        ("Reject undeclared render input variables", test_unknown_input_variable_is_rejected),
        ("Reject non-scalar render values", test_non_scalar_variable_is_rejected),
        ("Avoid recursive variable expansion", test_values_are_not_recursively_expanded),
        ("Archive prompt and verify saved status", test_archive_persists),
        ("Reject rendering archived prompts", test_archived_prompt_cannot_be_rendered),
        ("Reject editing archived prompts", test_archived_prompt_cannot_be_edited),
        ("Reject publishing archived prompts", test_archived_prompt_cannot_be_published),
        ("Allow repeated archive operation", test_archive_is_idempotent),
        ("Reject empty template content", test_template_requires_nonempty_content),
        ("Reject duplicate variable declarations", test_duplicate_variable_declarations_are_rejected),
        ("List prompts in sorted order", test_list_is_sorted_by_name),
    ]

    for name, operation in checks:
        check(name, operation)

    total = passed + failed
    print("=" * 68)
    print(f"REAL-OPERATION CHECKS PASSED: {passed}/{total}")
    print(f"REAL-OPERATION CHECKS FAILED: {failed}/{total}")
    print("PROMPT MANAGEMENT REAL-OPERATION TEST: " + ("PASS" if failed == 0 else "FAIL"))
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
