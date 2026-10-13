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
from ai.prompt_management.utils import (
    copy_metadata,
    extract_template_variables,
    utc_now,
    validate_declared_variables,
    validate_prompt_name,
    validate_template,
    validate_variable_names,
)


def run_tests():
    checks = 0

    # Utility: prompt name validation.
    assert validate_prompt_name("  welcome  ") == "welcome"
    checks += 1

    # Utility: template validation.
    assert validate_template("Hello {{name}}") == "Hello {{name}}"
    checks += 1

    # Utility: unique variables preserve order.
    assert extract_template_variables(
        "{{name}} and {{task}} and {{name}}"
    ) == ("name", "task")
    checks += 1

    # Utility: variable declaration validation.
    validate_declared_variables("Hello {{name}}", ["name"])
    checks += 1

    # Utility: metadata is defensively copied.
    source = {"team": "platform"}
    copied = copy_metadata(source)
    copied["team"] = "changed"
    assert source["team"] == "platform"
    checks += 1

    # Utility: timestamp is timezone-aware.
    assert utc_now().tzinfo is not None
    checks += 1

    # Utility: reject undeclared variables.
    try:
        validate_declared_variables("Hello {{unknown}}", ["name"])
        raise AssertionError("Undeclared variable was accepted.")
    except PromptValidationError:
        checks += 1

    # Utility: reject duplicate declarations.
    try:
        validate_variable_names(["name", "name"])
        raise AssertionError("Duplicate variable declarations were accepted.")
    except PromptValidationError:
        checks += 1

    engine = PromptManagementEngine()
    tenant_a = "tenant-a"
    tenant_b = "tenant-b"

    prompt = engine.create(CreatePromptRequest(
        tenant_id=tenant_a,
        name="welcome",
        template="Hello {{name}}. Task: {{task}}",
        variables=(
            PromptVariable("name"),
            PromptVariable("task", required=False, default="general help"),
        ),
    ))
    assert prompt.status == PromptStatus.DRAFT
    checks += 1

    assert engine.render(tenant_a, prompt.prompt_id, {"name": "ModelNow"}) == (
        "Hello ModelNow. Task: general help"
    )
    checks += 1

    try:
        engine.render(tenant_a, prompt.prompt_id)
        raise AssertionError("Missing required variable was accepted.")
    except MissingPromptVariablesError as exc:
        assert exc.missing == ("name",)
        checks += 1

    try:
        engine.get(tenant_b, prompt.prompt_id)
        raise AssertionError("Cross-tenant read was accepted.")
    except PromptNotFoundError:
        checks += 1

    try:
        engine.create(CreatePromptRequest(
            tenant_id=tenant_a,
            name="bad-template",
            template="Hello {{unknown}}",
        ))
        raise AssertionError("Undeclared template variable was accepted.")
    except PromptValidationError:
        checks += 1

    published = engine.publish(tenant_a, prompt.prompt_id, "Initial release")
    assert published.status == PromptStatus.PUBLISHED
    checks += 1

    assert engine.render(tenant_a, prompt.prompt_id, {"name": "Team"}) == (
        "Hello Team. Task: general help"
    )
    checks += 1

    try:
        engine.update_draft(
            tenant_a, prompt.prompt_id, template="Changed {{name}}",
        )
        raise AssertionError("Published prompt was edited.")
    except PromptConflictError:
        checks += 1

    rendered = engine.render(
        tenant_a, prompt.prompt_id, {"name": "{{task}}"},
    )
    assert rendered == "Hello {{task}}. Task: general help"
    checks += 1

    archived = engine.archive(tenant_a, prompt.prompt_id)
    assert archived.status == PromptStatus.ARCHIVED
    checks += 1

    try:
        engine.render(tenant_a, prompt.prompt_id, {"name": "Team"})
        raise AssertionError("Archived prompt was rendered.")
    except PromptConflictError:
        checks += 1

    print("PROMPT MANAGEMENT TESTS: PASS")
    print(f"Checks passed: {checks}")


if __name__ == "__main__":
    run_tests()
