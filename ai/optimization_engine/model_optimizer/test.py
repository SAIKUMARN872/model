from __future__ import annotations

import unittest
from decimal import Decimal

from .analyzer import ModelAnalyzer, ModelProfile
from .selector import (
    ModelSelectionConstraints,
    ModelSelector,
)
from .switcher import ModelSwitcher


def profile(
    model: str,
    provider: str,
    cost: str,
    latency: str,
    quality: str,
    availability: str = "1",
) -> ModelProfile:
    return ModelProfile(
        model=model,
        provider=provider,
        cost=Decimal(cost),
        latency_ms=Decimal(latency),
        quality_score=Decimal(quality),
        availability=Decimal(availability),
    )


class ModelAnalyzerTests(unittest.TestCase):

    def setUp(self) -> None:
        self.profiles = [
            profile(
                "slm-model",
                "provider-a",
                "0.001",
                "80",
                "0.72",
            ),
            profile(
                "mlm-model",
                "provider-b",
                "0.005",
                "120",
                "0.88",
            ),
            profile(
                "llm-model",
                "provider-c",
                "0.020",
                "250",
                "0.97",
            ),
        ]

    def test_analyze_models(self) -> None:
        analyzer = ModelAnalyzer()

        results = analyzer.analyze(self.profiles)

        self.assertEqual(len(results), 3)

        for result in results:
            self.assertGreaterEqual(
                result.overall_score,
                Decimal("0"),
            )
            self.assertLessEqual(
                result.overall_score,
                Decimal("1"),
            )

    def test_best_model(self) -> None:
        analyzer = ModelAnalyzer()

        result = analyzer.best(self.profiles)

        self.assertEqual(
            result.model,
            "llm-model",
        )

    def test_compare_models(self) -> None:
        analyzer = ModelAnalyzer()

        comparison = analyzer.compare(
            self.profiles[0],
            self.profiles[1],
        )

        self.assertEqual(
            comparison["cost_difference"],
            Decimal("0.004"),
        )

        self.assertEqual(
            comparison["latency_difference_ms"],
            Decimal("40"),
        )

        self.assertEqual(
            comparison["quality_difference"],
            Decimal("0.16"),
        )

    def test_empty_profiles(self) -> None:
        analyzer = ModelAnalyzer()

        with self.assertRaises(ValueError):
            analyzer.analyze([])

    def test_invalid_quality(self) -> None:
        analyzer = ModelAnalyzer()

        invalid = profile(
            "invalid",
            "provider-a",
            "0.01",
            "100",
            "1.5",
        )

        with self.assertRaises(ValueError):
            analyzer.analyze([invalid])


class ModelSelectorTests(unittest.TestCase):

    def setUp(self) -> None:
        self.profiles = [
            profile(
                "slm-model",
                "provider-a",
                "0.001",
                "80",
                "0.72",
            ),
            profile(
                "mlm-model",
                "provider-b",
                "0.005",
                "120",
                "0.88",
            ),
            profile(
                "llm-model",
                "provider-c",
                "0.020",
                "250",
                "0.97",
            ),
        ]

    def test_select_best_model(self) -> None:
        selector = ModelSelector()

        result = selector.select(self.profiles)

        self.assertEqual(
            result.model,
            "llm-model",
        )
        self.assertEqual(
            result.provider,
            "provider-c",
        )

    def test_quality_constraint(self) -> None:
        selector = ModelSelector()

        constraints = ModelSelectionConstraints(
            minimum_quality=Decimal("0.90"),
        )

        result = selector.select(
            self.profiles,
            constraints,
        )

        self.assertEqual(
            result.model,
            "llm-model",
        )

    def test_cost_constraint(self) -> None:
        selector = ModelSelector()

        constraints = ModelSelectionConstraints(
            maximum_cost=Decimal("0.006"),
        )

        result = selector.select(
            self.profiles,
            constraints,
        )

        self.assertNotEqual(
            result.model,
            "llm-model",
        )

        self.assertLessEqual(
            result.estimated_cost,
            Decimal("0.006"),
        )

    def test_latency_constraint(self) -> None:
        selector = ModelSelector()

        constraints = ModelSelectionConstraints(
            maximum_latency_ms=Decimal("100"),
        )

        result = selector.select(
            self.profiles,
            constraints,
        )

        self.assertEqual(
            result.model,
            "slm-model",
        )

    def test_availability_constraint(self) -> None:
        profiles = [
            profile(
                "available",
                "provider-a",
                "0.01",
                "100",
                "0.90",
                "1",
            ),
            profile(
                "unavailable",
                "provider-b",
                "0.001",
                "50",
                "0.99",
                "0.50",
            ),
        ]

        selector = ModelSelector()

        constraints = ModelSelectionConstraints(
            minimum_availability=Decimal("0.90"),
        )

        result = selector.select(
            profiles,
            constraints,
        )

        self.assertEqual(
            result.model,
            "available",
        )

    def test_no_feasible_model(self) -> None:
        selector = ModelSelector()

        constraints = ModelSelectionConstraints(
            minimum_quality=Decimal("0.99"),
        )

        with self.assertRaises(ValueError):
            selector.select(
                self.profiles,
                constraints,
            )

    def test_rank_models(self) -> None:
        selector = ModelSelector()

        results = selector.rank(self.profiles)

        self.assertEqual(
            len(results),
            3,
        )

        self.assertEqual(
            results[0].model,
            "llm-model",
        )


class ModelSwitcherTests(unittest.TestCase):

    def setUp(self) -> None:
        self.selection = ModelSelector().select(
            [
                profile(
                    "slm-model",
                    "provider-a",
                    "0.001",
                    "80",
                    "0.72",
                ),
                profile(
                    "llm-model",
                    "provider-c",
                    "0.020",
                    "250",
                    "0.97",
                ),
            ]
        )

    def test_switch_when_improved(self) -> None:
        switcher = ModelSwitcher()

        decision = switcher.evaluate(
            self.selection,
            current_model="slm-model",
            current_provider="provider-a",
            current_cost=Decimal("0.001"),
            current_latency_ms=Decimal("80"),
            current_quality_score=Decimal("0.72"),
        )

        self.assertTrue(
            decision.should_switch,
        )

        self.assertEqual(
            decision.selected_model,
            "llm-model",
        )

    def test_no_switch_same_model(self) -> None:
        selection = ModelSelector().select(
            [
                profile(
                    "slm-model",
                    "provider-a",
                    "0.001",
                    "80",
                    "0.72",
                ),
            ]
        )

        switcher = ModelSwitcher()

        decision = switcher.evaluate(
            selection,
            current_model="slm-model",
            current_provider="provider-a",
            current_cost=Decimal("0.001"),
            current_latency_ms=Decimal("80"),
            current_quality_score=Decimal("0.72"),
        )

        self.assertFalse(
            decision.should_switch,
        )

    def test_quality_threshold(self) -> None:
        switcher = ModelSwitcher(
            minimum_quality_improvement=Decimal("0.30"),
        )

        decision = switcher.evaluate(
            self.selection,
            current_model="slm-model",
            current_provider="provider-a",
            current_cost=Decimal("0.001"),
            current_latency_ms=Decimal("80"),
            current_quality_score=Decimal("0.72"),
        )

        self.assertFalse(
            decision.should_switch,
        )

    def test_cost_increase_threshold(self) -> None:
        switcher = ModelSwitcher(
            maximum_cost_increase=Decimal("0.005"),
        )

        decision = switcher.evaluate(
            self.selection,
            current_model="slm-model",
            current_provider="provider-a",
            current_cost=Decimal("0.001"),
            current_latency_ms=Decimal("80"),
            current_quality_score=Decimal("0.72"),
        )

        self.assertFalse(
            decision.should_switch,
        )

    def test_latency_increase_threshold(self) -> None:
        switcher = ModelSwitcher(
            maximum_latency_increase_ms=Decimal("50"),
        )

        decision = switcher.evaluate(
            self.selection,
            current_model="slm-model",
            current_provider="provider-a",
            current_cost=Decimal("0.001"),
            current_latency_ms=Decimal("80"),
            current_quality_score=Decimal("0.72"),
        )

        self.assertFalse(
            decision.should_switch,
        )

    def test_should_switch_helper(self) -> None:
        switcher = ModelSwitcher()

        decision = switcher.evaluate(
            self.selection,
            current_model="slm-model",
            current_provider="provider-a",
        )

        self.assertTrue(
            switcher.should_switch(decision),
        )


if __name__ == "__main__":
    unittest.main()
