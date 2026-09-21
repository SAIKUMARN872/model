from __future__ import annotations

import unittest

from model_registry.catalog.catalog import ModelCatalog
from model_registry.models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)
from model_registry.registry.manager import ModelRegistryManager
from model_registry.schemas import ModelQuery


def make_model(
    provider: str,
    model_id: str,
    display_name: str,
    *,
    tier: ModelTier,
    quality: float,
    latency: float,
    input_cost: float,
    output_cost: float,
    context: int,
    vision: bool = False,
    reasoning: bool = False,
    tool_use: bool = False,
    enabled: bool = True,
    available: bool = True,
    aliases: tuple[str, ...] = (),
) -> ModelRecord:
    return ModelRecord(
        provider=provider,
        model_id=model_id,
        display_name=display_name,
        tier=tier,
        context_window=context,
        max_output_tokens=16384,
        pricing=ModelPricing(
            input_per_1m_tokens=input_cost,
            output_per_1m_tokens=output_cost,
        ),
        capabilities=ModelCapabilities(
            chat=True,
            reasoning=reasoning,
            code=True,
            vision=vision,
            tool_use=tool_use,
            structured_output=True,
            streaming=True,
            long_context=context >= 100000,
            agentic=tool_use,
        ),
        latency_ms=latency,
        quality_score=quality,
        aliases=aliases,
        enabled=enabled,
        available=available,
    )


class TestModelCatalog(unittest.TestCase):

    def setUp(self):
        self.registry = ModelRegistryManager()

        self.fast = make_model(
            "openai",
            "fast-model",
            "Fast Model",
            tier=ModelTier.SLM,
            quality=0.82,
            latency=200.0,
            input_cost=0.20,
            output_cost=0.80,
            context=32000,
            aliases=("fast",),
        )

        self.quality = make_model(
            "anthropic",
            "quality-model",
            "Quality Model",
            tier=ModelTier.LLM,
            quality=0.98,
            latency=900.0,
            input_cost=3.00,
            output_cost=15.00,
            context=200000,
            vision=True,
            reasoning=True,
            tool_use=True,
            aliases=("quality",),
        )

        self.balanced = make_model(
            "google",
            "balanced-model",
            "Balanced Model",
            tier=ModelTier.MLM,
            quality=0.92,
            latency=500.0,
            input_cost=1.00,
            output_cost=4.00,
            context=128000,
            vision=True,
            tool_use=True,
            aliases=("balanced",),
        )

        self.disabled = make_model(
            "openai",
            "disabled-model",
            "Disabled Model",
            tier=ModelTier.MLM,
            quality=0.90,
            latency=400.0,
            input_cost=0.50,
            output_cost=2.00,
            context=64000,
            enabled=False,
        )

        self.unavailable = make_model(
            "google",
            "unavailable-model",
            "Unavailable Model",
            tier=ModelTier.MLM,
            quality=0.90,
            latency=400.0,
            input_cost=0.50,
            output_cost=2.00,
            context=64000,
            available=False,
        )

        for model in (
            self.fast,
            self.quality,
            self.balanced,
            self.disabled,
            self.unavailable,
        ):
            self.registry.register(model)

        self.catalog = ModelCatalog(self.registry)

    def test_all_models(self):
        models = self.catalog.all()

        self.assertEqual(len(models), 5)

    def test_search_by_model_id(self):
        result = self.catalog.search("quality-model")

        self.assertEqual(result, [self.quality])

    def test_search_by_display_name(self):
        result = self.catalog.search("Balanced Model")

        self.assertEqual(result, [self.balanced])

    def test_search_by_alias(self):
        result = self.catalog.search("fast")

        self.assertEqual(result, [self.fast])

    def test_search_is_case_insensitive(self):
        result = self.catalog.search("QUALITY MODEL")

        self.assertEqual(result, [self.quality])

    def test_empty_search_returns_all(self):
        result = self.catalog.search("")

        self.assertEqual(len(result), 5)

    def test_exact_match(self):
        result = self.catalog.find_exact("quality")

        self.assertEqual(result, self.quality)

    def test_provider_filter(self):
        result = self.catalog.by_provider("openai")

        self.assertEqual(
            {model.model_id for model in result},
            {"fast-model", "disabled-model"},
        )

    def test_tier_filter(self):
        result = self.catalog.filter(
            ModelQuery(tier=ModelTier.LLM)
        )

        self.assertEqual(result, [self.quality])

    def test_vision_filter(self):
        result = self.catalog.filter(
            ModelQuery(requires_vision=True)
        )

        self.assertEqual(
            {model.model_id for model in result},
            {"quality-model", "balanced-model"},
        )

    def test_reasoning_filter(self):
        result = self.catalog.filter(
            ModelQuery(requires_reasoning=True)
        )

        self.assertEqual(result, [self.quality])

    def test_tool_use_filter(self):
        result = self.catalog.filter(
            ModelQuery(requires_tool_use=True)
        )

        self.assertEqual(
            {model.model_id for model in result},
            {"quality-model", "balanced-model"},
        )

    def test_context_filter(self):
        result = self.catalog.filter(
            ModelQuery(min_context_window=100000)
        )

        self.assertEqual(
            {model.model_id for model in result},
            {"quality-model", "balanced-model"},
        )

    def test_input_cost_filter(self):
        result = self.catalog.filter(
            ModelQuery(max_input_cost_per_1m=1.00)
        )

        self.assertEqual(
            {model.model_id for model in result},
            {
                "fast-model",
                "balanced-model",
                "disabled-model",
                "unavailable-model",
            },
        )

    def test_output_cost_filter(self):
        result = self.catalog.filter(
            ModelQuery(max_output_cost_per_1m=4.00)
        )

        self.assertEqual(
            {model.model_id for model in result},
            {
                "fast-model",
                "balanced-model",
                "disabled-model",
                "unavailable-model",
            },
        )

    def test_latency_filter(self):
        result = self.catalog.filter(
            ModelQuery(max_latency_ms=500.0)
        )

        self.assertEqual(
            {model.model_id for model in result},
            {
                "fast-model",
                "balanced-model",
                "disabled-model",
                "unavailable-model",
            },
        )

    def test_quality_filter(self):
        result = self.catalog.filter(
            ModelQuery(min_quality_score=0.95)
        )

        self.assertEqual(result, [self.quality])

    def test_enabled_filter(self):
        result = self.catalog.filter(
            ModelQuery(enabled_only=True)
        )

        self.assertNotIn(self.disabled, result)
        self.assertIn(self.fast, result)

    def test_available_filter(self):
        result = self.catalog.filter(
            ModelQuery(available_only=True)
        )

        self.assertNotIn(self.unavailable, result)
        self.assertIn(self.fast, result)

    def test_combined_filter(self):
        result = self.catalog.filter(
            ModelQuery(
                tier=ModelTier.MLM,
                requires_vision=True,
                requires_tool_use=True,
                max_latency_ms=600.0,
                min_quality_score=0.90,
            )
        )

        self.assertEqual(result, [self.balanced])

    def test_sort_by_quality(self):
        result = self.catalog.by_quality()

        self.assertEqual(
            result[0],
            self.quality,
        )

    def test_sort_by_latency(self):
        result = self.catalog.by_latency()

        self.assertEqual(
            result[0],
            self.fast,
        )

    def test_sort_by_input_cost(self):
        result = self.catalog.by_input_cost()

        self.assertEqual(
            result[0],
            self.fast,
        )

    def test_sort_by_output_cost(self):
        result = self.catalog.by_output_cost()

        self.assertEqual(
            result[0],
            self.fast,
        )

    def test_deduplicate(self):
        result = self.catalog.deduplicate(
            [
                self.fast,
                self.quality,
                self.fast,
            ]
        )

        self.assertEqual(
            result,
            [self.fast, self.quality],
        )


if __name__ == "__main__":
    unittest.main()
