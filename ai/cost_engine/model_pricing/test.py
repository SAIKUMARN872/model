import json
import tempfile
from decimal import Decimal
from pathlib import Path

from .models import PricingEntry
from .pricing import PricingService
from .pricing_loader import PricingLoader
from .pricing_rules import validate_pricing
from .pricing_version import PricingVersion


def main() -> None:
    entry = PricingEntry(
        model="test-model",
        provider="test-provider",
        input_cost_per_1k_tokens=Decimal("0.001"),
        output_cost_per_1k_tokens=Decimal("0.002"),
    )

    validate_pricing(entry)
    print("PRICING VALIDATION: PASS")

    service = PricingService()
    service.register(entry)

    assert service.size == 1
    assert service.require(
        "test-model",
        "test-provider",
    ) == entry

    print("PRICING REGISTRATION: PASS")

    cost = service.calculate(
        model="test-model",
        provider="test-provider",
        input_tokens=1000,
        output_tokens=500,
    )

    assert cost == Decimal("0.002")
    print(f"PRICING CALCULATION: PASS ({cost} USD)")

    invalid_entry = PricingEntry(
        model="invalid-model",
        provider="test-provider",
        input_cost_per_1k_tokens=Decimal("-1"),
        output_cost_per_1k_tokens=Decimal("0.002"),
    )

    try:
        validate_pricing(invalid_entry)
        raise AssertionError("Negative pricing was accepted")
    except ValueError:
        print("INVALID PRICING REJECTION: PASS")

    pricing_data = {
        "pricing": [
            {
                "model": "json-model",
                "provider": "json-provider",
                "input_cost_per_1k_tokens": "0.003",
                "output_cost_per_1k_tokens": "0.004",
                "currency": "USD",
                "version": "1.0",
            }
        ]
    }

    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / "pricing.json"
        path.write_text(
            json.dumps(pricing_data),
            encoding="utf-8",
        )

        loader = PricingLoader()
        entries = loader.load_entries(path)

        assert len(entries) == 1
        assert entries[0].model == "json-model"

        service = PricingService()
        loaded = loader.load_into(path, service)

        assert loaded == 1
        assert service.size == 1

    print("JSON PRICING LOADER: PASS")

    version = PricingVersion.create("2.0")
    assert version.is_effective_at(version.effective_from)
    print("PRICING VERSION: PASS")

    print("MODEL PRICING: PASS")


if __name__ == "__main__":
    main()
