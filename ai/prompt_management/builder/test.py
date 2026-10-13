from ai.prompt_management.builder import (
    PromptBuildPipeline,
    PromptBuilder,
    PromptComposer,
    PromptParts,
)
from ai.prompt_management.builder.utils import join_nonempty, validate_text
from ai.prompt_management.exceptions import PromptValidationError


def run_tests():
    checks = 0

    composer = PromptComposer()
    result = composer.compose(PromptParts(
        system_instructions="Be concise.",
        context="ModelNow is an AI execution platform.",
        user_input="Explain automatic model routing.",
        additional_instructions=("Use bullet points.",),
    ))
    assert result.index("SYSTEM INSTRUCTIONS:") < result.index("CONTEXT:")
    assert result.index("CONTEXT:") < result.index("ADDITIONAL INSTRUCTION:")
    assert result.index("ADDITIONAL INSTRUCTION:") < result.index("USER INPUT:")
    checks += 1

    assert join_nonempty(" alpha ", "", "beta") == "alpha\n\nbeta"
    checks += 1

    assert validate_text("  hello  ") == "hello"
    checks += 1

    try:
        validate_text("   ")
        raise AssertionError("Empty text was accepted.")
    except PromptValidationError:
        checks += 1

    pipeline = PromptBuildPipeline()
    pipeline.add_step(
        lambda state: {**state, "prompt": state["prompt"] + "\nBe clear."}
    )
    pipeline.add_step(
        lambda state: {**state, "prompt": state["prompt"].replace("hello", "Hello")}
    )
    processed = pipeline.run({"prompt": "hello"})
    assert processed["prompt"] == "Hello\nBe clear."
    assert pipeline.step_count == 2
    checks += 1

    builder = PromptBuilder()
    built = builder.build(
        "Explain ModelNow.",
        system_instructions="You are a helpful assistant.",
        context="The platform optimizes cost, latency, and quality.",
    )
    assert "SYSTEM INSTRUCTIONS:" in built
    assert "CONTEXT:" in built
    assert "USER INPUT:\nExplain ModelNow." in built
    checks += 1

    try:
        builder.build_from_template("tenant-a", "missing-prompt")
        raise AssertionError("Template rendering without an engine was accepted.")
    except PromptValidationError:
        checks += 1

    print("PROMPT BUILDER TESTS: PASS")
    print(f"Checks passed: {checks}")


if __name__ == "__main__":
    run_tests()
