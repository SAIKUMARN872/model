from decimal import Decimal

from .allocator import ChargebackAllocator
from .calculator import ChargebackCalculator
from .exceptions import (
    ChargebackNotFoundError,
    InvalidChargebackError,
)
from .manager import ChargebackManager
from .models import ChargebackEntry
from .utils import (
    calculate_allocation,
    validate_allocation_percentages,
)


def test_models() -> None:
    entry = ChargebackEntry(
        chargeback_id="cb-001",
        amount=Decimal("10.00"),
        entity_type="project",
        entity_id="project-a",
    )

    assert entry.amount == Decimal("10.00")
    assert entry.entity_type == "project"
    assert entry.entity_id == "project-a"

    print("CHARGEBACK MODELS: PASS")


def test_utils() -> None:
    assert calculate_allocation(
        Decimal("100"),
        Decimal("25"),
    ) == Decimal("25")

    validate_allocation_percentages(
        [
            Decimal("60"),
            Decimal("40"),
        ]
    )

    try:
        validate_allocation_percentages(
            [
                Decimal("50"),
                Decimal("30"),
            ]
        )
        raise AssertionError(
            "Invalid percentages were accepted"
        )
    except ValueError:
        pass

    print("CHARGEBACK UTILITIES: PASS")


def test_calculator() -> None:
    calculator = ChargebackCalculator()

    allocations = calculator.calculate(
        total_amount=Decimal("100"),
        allocations=[
            ("team", "team-a", Decimal("60")),
            ("team", "team-b", Decimal("40")),
        ],
    )

    assert len(allocations) == 2
    assert allocations[0].amount == Decimal("60")
    assert allocations[1].amount == Decimal("40")

    single = calculator.calculate_single(
        total_amount=Decimal("50"),
        entity_type="project",
        entity_id="project-a",
    )

    assert single.amount == Decimal("50")
    assert single.percentage == Decimal("100")

    print("CHARGEBACK CALCULATOR: PASS")


def test_allocator() -> None:
    allocator = ChargebackAllocator()

    allocations = allocator.allocate_equal(
        total_amount=Decimal("100"),
        entities=[
            ("team", "team-a"),
            ("team", "team-b"),
        ],
    )

    assert len(allocations) == 2
    assert sum(
        allocation.amount
        for allocation in allocations
    ) == Decimal("100")

    assert sum(
        allocation.percentage
        for allocation in allocations
    ) == Decimal("100")

    print("CHARGEBACK ALLOCATOR: PASS")


def test_manager() -> None:
    manager = ChargebackManager()

    manager.create(
        chargeback_id="cb-001",
        amount=Decimal("10.50"),
        entity_type="project",
        entity_id="project-a",
        model="test-model",
        provider="test-provider",
    )

    manager.create(
        chargeback_id="cb-002",
        amount=Decimal("5.50"),
        entity_type="project",
        entity_id="project-a",
    )

    manager.create(
        chargeback_id="cb-003",
        amount=Decimal("20.00"),
        entity_type="project",
        entity_id="project-b",
    )

    assert manager.count() == 3

    entry = manager.require("cb-001")

    assert entry.amount == Decimal("10.50")
    assert entry.model == "test-model"

    assert manager.total_cost(
        entity_type="project",
        entity_id="project-a",
    ) == Decimal("16.00")

    summary = manager.summarize(
        entity_type="project",
        entity_id="project-a",
    )

    assert summary.total_cost == Decimal("16.00")
    assert summary.entry_count == 2

    allocations = manager.allocate(
        total_amount=Decimal("100"),
        allocations=[
            ("department", "engineering", Decimal("70")),
            ("department", "sales", Decimal("30")),
        ],
    )

    assert len(allocations) == 2
    assert sum(
        allocation.amount
        for allocation in allocations
    ) == Decimal("100")

    print("CHARGEBACK MANAGER: PASS")


def test_errors() -> None:
    manager = ChargebackManager()

    try:
        manager.require("missing")
        raise AssertionError(
            "Missing chargeback was accepted"
        )
    except ChargebackNotFoundError:
        pass

    try:
        manager.create(
            chargeback_id="",
            amount=Decimal("10"),
            entity_type="project",
            entity_id="project-a",
        )
        raise AssertionError(
            "Invalid chargeback was accepted"
        )
    except InvalidChargebackError:
        pass

    print("CHARGEBACK ERROR HANDLING: PASS")


def main() -> None:
    test_models()
    test_utils()
    test_calculator()
    test_allocator()
    test_manager()
    test_errors()

    print("CHARGEBACK: PASS")


if __name__ == "__main__":
    main()
