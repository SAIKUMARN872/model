from decimal import Decimal

from .engine import CostEngine, InMemoryCostTracker
from .model_pricing.models import PricingEntry
from .model_pricing.pricing import PricingService
from .models import CostRequest, TokenUsage
from .pricing_provider import ModelPricingProvider


def main() -> None:
    pricing_service = PricingService()

    pricing_service.register(
        PricingEntry(
            model="integration-model",
            provider="integration-provider",
            input_cost_per_1k_tokens=Decimal("0.003"),
            output_cost_per_1k_tokens=Decimal("0.006"),
            currency="USD",
            version="1.0",
        )
    )

    pricing_provider = ModelPricingProvider(pricing_service)
    tracker = InMemoryCostTracker()

    engine = CostEngine(
        pricing_provider=pricing_provider,
        tracker=tracker,
    )

    request = CostRequest(
        model="integration-model",
        provider="integration-provider",
        usage=TokenUsage(
            input_tokens=2000,
            output_tokens=1000,
        ),
        request_id="integration-001",
    )

    result = engine.calculate_cost(request)

    expected_input_cost = Decimal("0.006")
    expected_output_cost = Decimal("0.006")
    expected_total_cost = Decimal("0.012")

    assert result.input_cost == expected_input_cost
    assert result.output_cost == expected_output_cost
    assert result.total_cost == expected_total_cost
    assert result.total_tokens == 3000

    assert engine.get_total_cost() == expected_total_cost

    print("PRICING SERVICE: PASS")
    print("PRICING ADAPTER: PASS")
    print("COST ENGINE INTEGRATION: PASS")
    print(f"TOTAL TOKENS: {result.total_tokens}")
    print(f"TOTAL COST: {result.total_cost} {result.currency}")
    print("COST TRACKING: PASS")


if __name__ == "__main__":
    main()
