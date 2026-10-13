from ai.prompt_management.exceptions import PromptValidationError
from ai.prompt_management.executor import (
    ExecutionRequest,
    PromptExecutionDispatcher,
    PromptExecutionPipeline,
    PromptExecutor,
)


def run_tests():
    checks = 0

    executor = PromptExecutor(
        lambda prompt, context: {
            "output": f"Processed: {prompt}",
            "model": context.get("model_hint", "test-model"),
            "metadata": {"provider": "test-provider"},
        }
    )

    request = ExecutionRequest(
        prompt="Explain ModelNow",
        tenant_id="tenant-a",
        model_hint="test-model",
    )
    result = executor.execute(request)
    assert result.output == "Processed: Explain ModelNow"
    assert result.model == "test-model"
    assert result.metadata["provider"] == "test-provider"
    checks += 1

    string_executor = PromptExecutor(lambda prompt, context: "Simple result")
    assert string_executor.execute(
        ExecutionRequest("Hello", "tenant-a")
    ).output == "Simple result"
    checks += 1

    dispatcher = PromptExecutionDispatcher()
    dispatcher.register("default", executor)
    assert dispatcher.dispatch("default", request).output.startswith("Processed:")
    assert dispatcher.registered_names == ("default",)
    checks += 1

    try:
        dispatcher.dispatch("missing", request)
        raise AssertionError("Unknown executor was accepted.")
    except PromptValidationError:
        checks += 1

    try:
        dispatcher.register("default", executor)
        raise AssertionError("Duplicate executor was accepted.")
    except PromptValidationError:
        checks += 1

    pipeline = PromptExecutionPipeline()
    pipeline.add_step(
        lambda state: {**state, "prompt": state["prompt"].strip()}
    )
    pipeline.add_step(
        lambda state: {**state, "validated": bool(state["prompt"])}
    )
    output = pipeline.run({"prompt": "  hello  "})
    assert output["prompt"] == "hello"
    assert output["validated"] is True
    assert pipeline.step_count == 2
    checks += 1

    try:
        PromptExecutor(lambda prompt, context: "")
        # Handler output is checked during execution, not construction.
        PromptExecutor(lambda prompt, context: "").execute(request)
        raise AssertionError("Empty model output was accepted.")
    except PromptValidationError:
        checks += 1

    try:
        executor.execute(ExecutionRequest(" ", "tenant-a"))
        raise AssertionError("Empty prompt was accepted.")
    except PromptValidationError:
        checks += 1

    print("PROMPT EXECUTOR TESTS: PASS")
    print(f"Checks passed: {checks}")


if __name__ == "__main__":
    run_tests()
