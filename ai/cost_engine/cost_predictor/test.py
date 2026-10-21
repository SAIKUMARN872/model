from decimal import Decimal

from ..model_pricing.models import PricingEntry
from ..model_pricing.pricing import PricingService
from .estimator import CostEstimator
from .features import extract_features
from .models import CostPredictionRequest
from .predictor import CostPredictor
from .utils import (
    calculate_confidence,
    calculate_token_cost,
    calculate_total_cost,
)


def create_pricing_service() -> PricingService:
    service = PricingService()

    service.register(
        PricingEntry(
            model="test-model",
            provider="test-provider",
            input_cost_per_1k_tokens=Decimal("0.002"),
            output_cost_per_1k_tokens=Decimal("0.004"),
            currency="USD",
        )
    )

    return service


def test_features() -> None:
    request = CostPredictionRequest(
        model="test-model",
        provider="test-provider",
        input_tokens=1000,
        expected_output_tokens=500,
    )

    features = extract_features(request)

    assert features.input_tokens == 1000
    assert features.expected_output_tokens == 500
    assert features.total_expected_tokens == 1500

    assert (
        features.input_token_ratio
        + features.output_token_ratio
        == Decimal("1")
    )

    print("COST PREDICTOR FEATURES: PASS")


def test_utils() -> None:
    assert calculate_token_cost(
        1000,
        Decimal("0.002"),
    ) == Decimal("0.002")

    assert calculate_total_cost(
        input_tokens=1000,
        output_tokens=500,
        input_cost_per_1k_tokens=Decimal("0.002"),
        output_cost_per_1k_tokens=Decimal("0.004"),
    ) == Decimal("0.004")

    confidence = calculate_confidence(
        minimum_cost=Decimal("0.002"),
        expected_cost=Decimal("0.003"),
        maximum_cost=Decimal("0.004"),
    )

    assert confidence == Decimal("0.5")

    print("COST PREDICTOR UTILITIES: PASS")


def test_estimator() -> None:
    service = create_pricing_service()
    estimator = CostEstimator(service)

    request = CostPredictionRequest(
        model="test-model",
        provider="test-provider",
        input_tokens=1000,
        expected_output_tokens=500,
        request_id="req-001",
    )

    prediction = estimator.predict(request)

    assert prediction.predicted_input_cost == Decimal(
        "0.002"
    )

    assert prediction.predicted_output_cost == Decimal(
        "0.002"
    )

    assert prediction.predicted_total_cost == Decimal(
        "0.004"
    )

    assert prediction.request_id == "req-001"

    estimate = estimator.estimate_range(
        request=request,
        minimum_output_tokens=250,
        maximum_output_tokens=1000,
    )

    assert estimate.minimum_cost < estimate.expected_cost
    assert estimate.expected_cost < estimate.maximum_cost
    assert estimate.confidence == Decimal("1")

    print("COST ESTIMATOR: PASS")


def test_predictor() -> None:
    service = create_pricing_service()
    predictor = CostPredictor(service)

    request = CostPredictionRequest(
        model="test-model",
        provider="test-provider",
        input_tokens=2000,
        expected_output_tokens=1000,
    )

    prediction = predictor.predict(request)

    assert prediction.predicted_total_cost == Decimal(
        "0.008"
    )

    cost = predictor.predict_cost(
        model="test-model",
        provider="test-provider",
        input_tokens=2000,
        expected_output_tokens=1000,
    )

    assert cost == Decimal("0.008")

    print("COST PREDICTOR: PASS")


def test_validation() -> None:
    service = create_pricing_service()
    estimator = CostEstimator(service)

    invalid_request = CostPredictionRequest(
        model="test-model",
        provider="test-provider",
        input_tokens=-1,
        expected_output_tokens=100,
    )

    try:
        estimator.predict(invalid_request)
        raise AssertionError(
            "Negative token count was accepted"
        )
    except ValueError:
        pass

    print("COST PREDICTOR VALIDATION: PASS")


def main() -> None:
    test_features()
    test_utils()
    test_estimator()
    test_predictor()
    test_validation()

    print("COST PREDICTOR: PASS")


if __name__ == "__main__":
    main()
