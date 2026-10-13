"""Tests for ModelNow request intelligence."""

from __future__ import annotations

from .analyzer import RequestIntelligenceAnalyzer


def print_requirements(name: str, requirements) -> None:
    print()
    print("-" * 100)
    print(f"TEST: {name}")
    print(f"COMPLEXITY: {requirements.complexity:.3f}")
    print(f"QUALITY REQUIREMENT: {requirements.quality_requirement:.3f}")
    print(f"COST SENSITIVITY: {requirements.cost_sensitivity:.3f}")
    print(f"LATENCY SENSITIVITY: {requirements.latency_sensitivity:.3f}")
    print(f"CONTEXT TOKENS: {requirements.context_tokens}")
    print(f"CODING: {requirements.coding_required}")
    print(f"REASONING: {requirements.reasoning_required}")
    print(f"AGENTIC: {requirements.agentic_required}")
    print(f"LONG CONTEXT: {requirements.long_context_required}")
    print(f"STREAMING: {requirements.streaming_required}")
    print(f"CAPABILITIES: {requirements.required_capabilities}")
    print(
        "WEIGHTS: "
        f"quality={requirements.quality_weight:.3f}, "
        f"cost={requirements.cost_weight:.3f}, "
        f"latency={requirements.latency_weight:.3f}"
    )
    print(f"PREFERRED TIER: {requirements.preferred_tier}")


def main() -> None:
    print("=" * 100)
    print("MODELNOW REQUEST INTELLIGENCE TEST")
    print("=" * 100)

    analyzer = RequestIntelligenceAnalyzer()

    # ------------------------------------------------------------------
    # SIMPLE / LOW-COST REQUEST
    # ------------------------------------------------------------------

    simple = analyzer.analyze(
        "What is 2 + 2? I need the cheapest and fastest answer."
    )

    print_requirements("SIMPLE + COST/LATENCY", simple)

    assert simple.preferred_tier == "slm"
    assert simple.cost_sensitivity >= 0.80
    assert simple.latency_sensitivity >= 0.80
    print("SIMPLE REQUEST: PASS")

    # ------------------------------------------------------------------
    # CODING REQUEST
    # ------------------------------------------------------------------

    coding = analyzer.analyze(
        "Write a Python function that removes duplicate values "
        "from a list and explain the time complexity."
    )

    print_requirements("CODING", coding)

    assert coding.coding_required is True
    assert "code" in coding.required_capabilities
    assert coding.preferred_tier in {"mlm", "llm"}
    print("CODING REQUEST: PASS")

    # ------------------------------------------------------------------
    # REASONING REQUEST
    # ------------------------------------------------------------------

    reasoning = analyzer.analyze(
        "Analyze the trade-offs between microservices and a "
        "monolithic architecture for a production enterprise system."
    )

    print_requirements("REASONING", reasoning)

    assert reasoning.reasoning_required is True
    assert "reasoning" in reasoning.required_capabilities
    assert reasoning.quality_requirement >= 0.60
    print("REASONING REQUEST: PASS")

    # ------------------------------------------------------------------
    # AGENTIC ENTERPRISE REQUEST
    # ------------------------------------------------------------------

    agentic = analyzer.analyze(
        "Design an enterprise multi-agent workflow with tool execution, "
        "browser automation, security, governance and failure recovery."
    )

    print_requirements("AGENTIC ENTERPRISE", agentic)

    assert agentic.agentic_required is True
    assert "agentic" in agentic.required_capabilities
    assert agentic.preferred_tier == "llm"
    print("AGENTIC REQUEST: PASS")

    # ------------------------------------------------------------------
    # LONG CONTEXT REQUEST
    # ------------------------------------------------------------------

    long_context = analyzer.analyze(
        "Summarize the entire enterprise document and identify "
        "the important risks.",
        context=" ".join(["enterprise architecture document"] * 10000),
    )

    print_requirements("LONG CONTEXT", long_context)

    assert long_context.long_context_required is True
    assert "long_context" in long_context.required_capabilities
    assert long_context.context_tokens >= 12000
    print("LONG CONTEXT REQUEST: PASS")

    # ------------------------------------------------------------------
    # STREAMING REQUEST
    # ------------------------------------------------------------------

    streaming = analyzer.analyze(
        "Give me a streaming real-time response."
    )

    print_requirements("STREAMING", streaming)

    assert streaming.streaming_required is True
    assert "streaming" in streaming.required_capabilities
    print("STREAMING REQUEST: PASS")

    # ------------------------------------------------------------------
    # EMPTY REQUEST
    # ------------------------------------------------------------------

    empty = analyzer.analyze("")

    print_requirements("EMPTY", empty)

    assert empty.context_tokens == 0
    assert empty.required_capabilities == ()
    print("EMPTY REQUEST: PASS")

    # ------------------------------------------------------------------
    # WEIGHT VALIDATION
    # ------------------------------------------------------------------

    for requirements in (
        simple,
        coding,
        reasoning,
        agentic,
        long_context,
        streaming,
        empty,
    ):
        weight_sum = (
            requirements.quality_weight
            + requirements.cost_weight
            + requirements.latency_weight
        )

        assert abs(weight_sum - 1.0) < 1e-6

    print("WEIGHT NORMALIZATION: PASS")

    print()
    print("=" * 100)
    print("REQUEST INTELLIGENCE: PASS")
    print("=" * 100)


if __name__ == "__main__":
    main()
