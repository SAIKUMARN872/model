from ai.model_registry.models import (
    ModelRecord,
    ModelTier,
    ModelCapabilities,
    ModelPricing,
)
from ai.model_registry.registry.manager import ModelRegistryManager


def main():
    registry = ModelRegistryManager()

    model = ModelRecord(
        provider="openai",
        model_id="example-model",
        display_name="Example Model",
        tier=ModelTier.LLM,
        context_window=128000,
        max_output_tokens=16384,
        pricing=ModelPricing(
            input_per_1m_tokens=1.0,
            output_per_1m_tokens=4.0,
        ),
        capabilities=ModelCapabilities(
            chat=True,
            reasoning=True,
            code=True,
            vision=True,
            tool_use=True,
            structured_output=True,
            streaming=True,
            long_context=True,
            agentic=True,
        ),
        latency_ms=500.0,
        quality_score=0.95,
        aliases=("example",),
    )

    registry.register(model)

    assert registry.count() == 1
    assert registry.get("openai", "example-model") == model
    assert registry.get_by_id(
        "openai:example-model"
    ) == model

    assert registry.find("example") == [model]
    assert registry.find("Example Model") == [model]

    assert registry.list_models(
        provider="openai"
    ) == [model]

    assert "openai" in registry.providers()

    removed = registry.remove(
        "openai",
        "example-model",
    )

    assert removed == model
    assert registry.count() == 0

    print("MODEL REGISTRY TEST: PASS")


if __name__ == "__main__":
    main()

