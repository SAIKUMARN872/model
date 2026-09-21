from __future__ import annotations

from decimal import Decimal

import unittest

from ..models import ModelPricing, ModelRecord
from .currency import (
    normalize_currency,
    round_money,
    validate_currency,
)
from .pricing import (
    PricingCalculator,
    PricingStore,
)
from .rates import PricingRate, TokenUsage
from .utils import (
    average_cost,
    cheapest_models,
    pricing_rate_from_model,
    total_cost,
)


def make_model(
    provider: str = "openai",
    model_id: str = "test-model",
    input_price: float = 2.0,
    output_price: float = 8.0,
) -> ModelRecord:
    return ModelRecord(
        provider=provider,
        model_id=model_id,
        display_name="Test Model",
        pricing=ModelPricing(
            input_per_1m_tokens=input_price,
            output_per_1m_tokens=output_price,
            currency="USD",
        ),
    )


class TestCurrency(unittest.TestCase):

    def test_normalize_currency(self):
        self.assertEqual(
            normalize_currency(" usd "),
            "USD",
        )

    def test_normalize_currency_rejects_non_string(self):
        with self.assertRaises(TypeError):
            normalize_currency(123)  # type: ignore[arg-type]

    def test_normalize_currency_rejects_empty(self):
        with self.assertRaises(ValueError):
            normalize_currency("")

    def test_validate_supported_currency(self):
        self.assertEqual(
            validate_currency("USD"),
            "USD",
        )

    def test_validate_currency_rejects_unknown(self):
        with self.assertRaises(ValueError):
            validate_currency("XYZ")

    def test_round_money(self):
        self.assertEqual(
            round_money(1.23456789),
            Decimal("1.234568"),
        )

    def test_round_money_rejects_negative_places(self):
        with self.assertRaises(ValueError):
            round_money(1.0, -1)


class TestPricingRate(unittest.TestCase):

    def test_default_rate(self):
        rate = PricingRate()

        self.assertEqual(
            rate.input_per_1m_tokens,
            0.0,
        )
        self.assertEqual(
            rate.output_per_1m_tokens,
            0.0,
        )
        self.assertEqual(
            rate.currency,
            "USD",
        )

    def test_custom_rate(self):
        rate = PricingRate(
            input_per_1m_tokens=2.5,
            output_per_1m_tokens=10.0,
            currency="USD",
        )

        self.assertEqual(
            rate.input_per_1m_tokens,
            2.5,
        )
        self.assertEqual(
            rate.output_per_1m_tokens,
            10.0,
        )

    def test_negative_input_price_rejected(self):
        with self.assertRaises(ValueError):
            PricingRate(
                input_per_1m_tokens=-1.0
            )

    def test_negative_output_price_rejected(self):
        with self.assertRaises(ValueError):
            PricingRate(
                output_per_1m_tokens=-1.0
            )


class TestTokenUsage(unittest.TestCase):

    def test_usage(self):
        usage = TokenUsage(
            input_tokens=1000,
            output_tokens=500,
        )

        self.assertEqual(
            usage.input_tokens,
            1000,
        )
        self.assertEqual(
            usage.output_tokens,
            500,
        )

    def test_negative_input_tokens_rejected(self):
        with self.assertRaises(ValueError):
            TokenUsage(
                input_tokens=-1
            )

    def test_negative_output_tokens_rejected(self):
        with self.assertRaises(ValueError):
            TokenUsage(
                output_tokens=-1
            )


class TestPricingCalculator(unittest.TestCase):

    def test_rate_from_model(self):
        model = make_model()

        calculator = PricingCalculator()

        rate = calculator.rate_from_model(
            model
        )

        self.assertEqual(
            rate.input_per_1m_tokens,
            2.0,
        )
        self.assertEqual(
            rate.output_per_1m_tokens,
            8.0,
        )
        self.assertEqual(
            rate.currency,
            "USD",
        )

    def test_rate_from_model_rejects_invalid(self):
        calculator = PricingCalculator()

        with self.assertRaises(TypeError):
            calculator.rate_from_model(
                "invalid"  # type: ignore[arg-type]
            )

    def test_calculate_input_cost(self):
        model = make_model()

        calculator = PricingCalculator()

        result = calculator.calculate(
            model,
            TokenUsage(
                input_tokens=1_000_000,
                output_tokens=0,
            ),
        )

        self.assertEqual(
            result.input_cost,
            2.0,
        )
        self.assertEqual(
            result.output_cost,
            0.0,
        )
        self.assertEqual(
            result.total_cost,
            2.0,
        )

    def test_calculate_output_cost(self):
        model = make_model()

        calculator = PricingCalculator()

        result = calculator.calculate(
            model,
            TokenUsage(
                input_tokens=0,
                output_tokens=1_000_000,
            ),
        )

        self.assertEqual(
            result.input_cost,
            0.0,
        )
        self.assertEqual(
            result.output_cost,
            8.0,
        )
        self.assertEqual(
            result.total_cost,
            8.0,
        )

    def test_calculate_combined_cost(self):
        model = make_model()

        calculator = PricingCalculator()

        result = calculator.calculate(
            model,
            TokenUsage(
                input_tokens=500_000,
                output_tokens=250_000,
            ),
        )

        self.assertEqual(
            result.input_cost,
            1.0,
        )
        self.assertEqual(
            result.output_cost,
            2.0,
        )
        self.assertEqual(
            result.total_cost,
            3.0,
        )

    def test_calculate_qualified_id(self):
        model = make_model()

        result = PricingCalculator().calculate(
            model,
            TokenUsage(
                input_tokens=100,
                output_tokens=100,
            ),
        )

        self.assertEqual(
            result.qualified_id,
            "openai:test-model",
        )

    def test_estimate(self):
        model = make_model()

        result = PricingCalculator().estimate(
            model,
            input_tokens=1_000_000,
            output_tokens=1_000_000,
        )

        self.assertEqual(
            result.total_cost,
            10.0,
        )


class TestPricingStore(unittest.TestCase):

    def test_register(self):
        model = make_model()

        store = PricingStore()

        result = store.register(model)

        self.assertEqual(
            result,
            model.pricing,
        )
        self.assertEqual(
            store.count(),
            1,
        )

    def test_register_duplicate(self):
        model = make_model()

        store = PricingStore(
            [model]
        )

        with self.assertRaises(ValueError):
            store.register(model)

    def test_upsert(self):
        first = make_model(
            input_price=2.0
        )

        second = make_model(
            input_price=3.0
        )

        store = PricingStore(
            [first]
        )

        store.upsert(second)

        result = store.get(
            "openai",
            "test-model",
        )

        self.assertEqual(
            result.input_per_1m_tokens,
            3.0,
        )

    def test_get(self):
        model = make_model()

        store = PricingStore(
            [model]
        )

        self.assertEqual(
            store.get(
                "openai",
                "test-model",
            ),
            model.pricing,
        )

    def test_get_by_id(self):
        model = make_model()

        store = PricingStore(
            [model]
        )

        self.assertEqual(
            store.get_by_id(
                "OPENAI:TEST-MODEL"
            ),
            model.pricing,
        )

    def test_get_missing(self):
        store = PricingStore()

        self.assertIsNone(
            store.get(
                "openai",
                "missing",
            )
        )

    def test_remove(self):
        model = make_model()

        store = PricingStore(
            [model]
        )

        removed = store.remove(
            "openai",
            "test-model",
        )

        self.assertEqual(
            removed,
            model.pricing,
        )
        self.assertEqual(
            store.count(),
            0,
        )

    def test_clear(self):
        store = PricingStore(
            [
                make_model(
                    model_id="model-a"
                ),
                make_model(
                    model_id="model-b"
                ),
            ]
        )

        store.clear()

        self.assertEqual(
            store.count(),
            0,
        )

    def test_rejects_invalid_model(self):
        store = PricingStore()

        with self.assertRaises(TypeError):
            store.register(
                "invalid"  # type: ignore[arg-type]
            )


class TestPricingUtils(unittest.TestCase):

    def test_pricing_rate_from_model(self):
        model = make_model()

        rate = pricing_rate_from_model(
            model
        )

        self.assertEqual(
            rate.input_per_1m_tokens,
            2.0,
        )
        self.assertEqual(
            rate.output_per_1m_tokens,
            8.0,
        )

    def test_pricing_rate_rejects_invalid(self):
        with self.assertRaises(TypeError):
            pricing_rate_from_model(
                "invalid"  # type: ignore[arg-type]
            )

    def test_cheapest_models(self):
        expensive = make_model(
            model_id="expensive",
            input_price=5.0,
            output_price=15.0,
        )

        cheap = make_model(
            model_id="cheap",
            input_price=1.0,
            output_price=3.0,
        )

        result = cheapest_models(
            [expensive, cheap]
        )

        self.assertEqual(
            result,
            [cheap, expensive],
        )

    def test_average_cost(self):
        calculator = PricingCalculator()
        model = make_model()

        first = calculator.estimate(
            model,
            1_000_000,
            0,
        )

        second = calculator.estimate(
            model,
            0,
            1_000_000,
        )

        self.assertEqual(
            average_cost(
                [first, second]
            ),
            5.0,
        )

    def test_average_empty_costs(self):
        self.assertEqual(
            average_cost([]),
            0.0,
        )

    def test_total_cost(self):
        calculator = PricingCalculator()
        model = make_model()

        first = calculator.estimate(
            model,
            1_000_000,
            0,
        )

        second = calculator.estimate(
            model,
            0,
            1_000_000,
        )

        self.assertEqual(
            total_cost(
                [first, second]
            ),
            10.0,
        )

    def test_total_empty_costs(self):
        self.assertEqual(
            total_cost([]),
            0,
        )


if __name__ == "__main__":
    unittest.main()


