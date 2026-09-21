from __future__ import annotations

import unittest

from model_registry.models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)
from model_registry.validator.validator import (
    ModelValidationException,
    ModelValidator,
)


def valid_model(**overrides) -> ModelRecord:
    values = {
        "provider": "openai",
        "model_id": "test-model",
        "display_name": "Test Model",
        "tier": ModelTier.MLM,
        "context_window": 128000,
        "max_output_tokens": 16384,
        "pricing": ModelPricing(
            input_per_1m_tokens=1.0,
            output_per_1m_tokens=4.0,
        ),
        "capabilities": ModelCapabilities(),
        "latency_ms": 500.0,
        "quality_score": 0.95,
        "aliases": ("test",),
    }

    values.update(overrides)
    return ModelRecord(**values)


class TestModelValidator(unittest.TestCase):

    def setUp(self):
        self.validator = ModelValidator()

    def test_valid_model(self):
        model = valid_model()

        self.validator.validate(model)

        self.assertTrue(
            self.validator.is_valid(model)
        )

    def test_empty_provider(self):
        model = valid_model(provider="")

        with self.assertRaises(ModelValidationException):
            self.validator.validate(model)

    def test_empty_model_id(self):
        model = valid_model(model_id="")

        with self.assertRaises(ModelValidationException):
            self.validator.validate(model)

    def test_empty_display_name(self):
        model = valid_model(display_name="")

        with self.assertRaises(ModelValidationException):
            self.validator.validate(model)

    def test_invalid_tier(self):
        model = valid_model(
            tier="invalid-tier"
        )

        with self.assertRaises(ModelValidationException):
            self.validator.validate(model)

    def test_negative_context_window(self):
        model = valid_model(
            context_window=-1
        )

        with self.assertRaises(ModelValidationException):
            self.validator.validate(model)

    def test_zero_context_window(self):
        model = valid_model(
            context_window=0
        )

        with self.assertRaises(ModelValidationException):
            self.validator.validate(model)

    def test_negative_max_output_tokens(self):
        model = valid_model(
            max_output_tokens=-1
        )

        with self.assertRaises(ModelValidationException):
            self.validator.validate(model)

    def test_zero_max_output_tokens(self):
        model = valid_model(
            max_output_tokens=0
        )

        with self.assertRaises(ModelValidationException):
            self.validator.validate(model)

    def test_negative_input_pricing(self):
        model = valid_model(
            pricing=ModelPricing(
                input_per_1m_tokens=-1.0,
                output_per_1m_tokens=4.0,
            )
        )

        with self.assertRaises(ModelValidationException):
            self.validator.validate(model)

    def test_negative_output_pricing(self):
        model = valid_model(
            pricing=ModelPricing(
                input_per_1m_tokens=1.0,
                output_per_1m_tokens=-1.0,
            )
        )

        with self.assertRaises(ModelValidationException):
            self.validator.validate(model)

    def test_negative_latency(self):
        model = valid_model(
            latency_ms=-1.0
        )

        with self.assertRaises(ModelValidationException):
            self.validator.validate(model)

    def test_invalid_quality_score(self):
        model = valid_model(
            quality_score=1.5
        )

        with self.assertRaises(ModelValidationException):
            self.validator.validate(model)

    def test_negative_quality_score(self):
        model = valid_model(
            quality_score=-0.1
        )

        with self.assertRaises(ModelValidationException):
            self.validator.validate(model)

    def test_valid_optional_metrics(self):
        model = valid_model(
            latency_ms=None,
            quality_score=None,
        )

        self.validator.validate(model)

        self.assertTrue(
            self.validator.is_valid(model)
        )

    def test_invalid_aliases(self):
        model = valid_model(
            aliases=["test"]
        )

        with self.assertRaises(ModelValidationException):
            self.validator.validate(model)

    def test_empty_alias(self):
        model = valid_model(
            aliases=("",)
        )

        with self.assertRaises(ModelValidationException):
            self.validator.validate(model)

    def test_non_model_record(self):
        with self.assertRaises(TypeError):
            self.validator.validate("not-a-model")

    def test_is_valid_returns_false_for_invalid_model(self):
        model = valid_model(
            quality_score=2.0
        )

        self.assertFalse(
            self.validator.is_valid(model)
        )

    def test_exception_contains_errors(self):
        model = valid_model(
            provider="",
            model_id="",
        )

        with self.assertRaises(ModelValidationException) as context:
            self.validator.validate(model)

        self.assertGreaterEqual(
            len(context.exception.errors),
            2,
        )


if __name__ == "__main__":
    unittest.main()
