from decimal import Decimal

from ai.model_registry.engine import ModelRegistryEngine
from ai.model_registry.models import ModelPricing as RegistryModelPricing
from ai.model_registry.models import ModelRecord

from .engine import CostEngine, InMemoryCostTracker
from .models import CostRequest, TokenUsage
from .pricing_provider import ModelRegistryPricingProvider


def main() -> None:
    print("MODELNOW COST ENGINE REAL INTEGRATION TEST")

    # ------------------------------------------------------------------
    # 1. Create canonical Model Registry
    # ------------------------------------------------------------------
    registry = ModelRegistryEngine()

    registry.register_many(
        [
            ModelRecord(
                provider="provider-slm",
                model_id="slm-fast",
                display_name="SLM Fast",
                pricing=RegistryModelPricing(
                    input_per_1m_tokens=1.00,
                    output_per_1m_tokens=2.00,
                    currency="USD",
                ),
                version="1.0",
            ),
            ModelRecord(
                provider="provider-mlm",
                model_id="mlm-balanced",
                display_name="MLM Balanced",
                pricing=RegistryModelPricing(
                    input_per_1m_tokens=3.00,
                    output_per_1m_tokens=6.00,
                    currency="USD",
                ),
                version="2.0",
            ),
            ModelRecord(
                provider="provider-llm",
                model_id="llm-premium",
                display_name="LLM Premium",
                pricing=RegistryModelPricing(
                    input_per_1m_tokens=10.00,
                    output_per_1m_tokens=20.00,
                    currency="USD",
                ),
                version="3.0",
            ),
        ]
    )

    assert registry.count() == 3
    print("MODEL REGISTRY: PASS")
    print(f"  registered_models={registry.count()}")

    # ------------------------------------------------------------------
    # 2. Connect Cost Engine directly to canonical registry pricing
    # ------------------------------------------------------------------
    pricing_provider = ModelRegistryPricingProvider(registry)
    tracker = InMemoryCostTracker()

    engine = CostEngine(
        pricing_provider=pricing_provider,
        tracker=tracker,
    )

    print("REGISTRY PRICING PROVIDER: PASS")

    # ------------------------------------------------------------------
    # 3. Calculate real cost using registry pricing
    # ------------------------------------------------------------------
    request = CostRequest(
        model="mlm-balanced",
        provider="provider-mlm",
        usage=TokenUsage(
            input_tokens=2000,
            output_tokens=1000,
        ),
        request_id="real-cost-001",
    )

    result = engine.calculate_cost(request)

    # Registry pricing:
    # input  = $3 / 1M tokens -> 2000 = $0.006
    # output = $6 / 1M tokens -> 1000 = $0.006
    # total  = $0.012
    assert result.input_cost == Decimal("0.00600000")
    assert result.output_cost == Decimal("0.00600000")
    assert result.total_cost == Decimal("0.01200000")
    assert result.total_tokens == 3000
    assert result.currency == "USD"
    assert result.request_id == "real-cost-001"

    print("CANONICAL PRICING LOOKUP: PASS")
    print(f"  model={result.model}")
    print(f"  provider={result.provider}")
    print(f"  input_cost={result.input_cost} USD")
    print(f"  output_cost={result.output_cost} USD")
    print(f"  total_cost={result.total_cost} USD")

    # ------------------------------------------------------------------
    # 4. Verify cost tracking
    # ------------------------------------------------------------------
    assert engine.get_total_cost() == Decimal("0.01200000")
    assert (
        engine.get_total_cost(
            model="mlm-balanced",
            provider="provider-mlm",
        )
        == Decimal("0.01200000")
    )
    assert len(tracker.records) == 1

    print("COST TRACKING: PASS")

    # ------------------------------------------------------------------
    # 5. Verify multiple models/providers use their own registry pricing
    # ------------------------------------------------------------------
    slm_result = engine.calculate_cost(
        CostRequest(
            model="slm-fast",
            provider="provider-slm",
            usage=TokenUsage(
                input_tokens=1000,
                output_tokens=1000,
            ),
            request_id="real-cost-002",
        )
    )

    llm_result = engine.calculate_cost(
        CostRequest(
            model="llm-premium",
            provider="provider-llm",
            usage=TokenUsage(
                input_tokens=1000,
                output_tokens=1000,
            ),
            request_id="real-cost-003",
        )
    )

    assert slm_result.total_cost == Decimal("0.00300000")
    assert llm_result.total_cost == Decimal("0.03000000")

    print("MULTI-MODEL PRICING: PASS")
    print(f"  slm_cost={slm_result.total_cost} USD")
    print(f"  llm_cost={llm_result.total_cost} USD")

    # ------------------------------------------------------------------
    # 6. Verify accumulated tracking
    # ------------------------------------------------------------------
    expected_total = (
        Decimal("0.01200000")
        + Decimal("0.00300000")
        + Decimal("0.03000000")
    )

    assert engine.get_total_cost() == expected_total

    print("ACCUMULATED COST TRACKING: PASS")
    print(f"  tracked_total={engine.get_total_cost()} USD")

    # ------------------------------------------------------------------
    # 7. Verify missing registry pricing fails safely
    # ------------------------------------------------------------------
    try:
        engine.calculate_cost(
            CostRequest(
                model="unknown-model",
                provider="unknown-provider",
                usage=TokenUsage(
                    input_tokens=100,
                    output_tokens=100,
                ),
                request_id="real-cost-missing",
            )
        )
    except ValueError as exc:
        assert "No pricing found" in str(exc)
        print("MISSING PRICING HANDLING: PASS")
    else:
        raise AssertionError(
            "Expected missing registry pricing to raise ValueError"
        )

    print("PASS - MODELNOW COST ENGINE REAL INTEGRATION TEST")


if __name__ == "__main__":
    main()
