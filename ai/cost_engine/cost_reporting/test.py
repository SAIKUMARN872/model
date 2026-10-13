from decimal import Decimal

from .aggregator import CostAggregator
from .exporter import CostReportExporter
from .models import CostReportEntry
from .reporter import CostReporter
from .utils import (
    calculate_cost_share,
    calculate_total_cost,
    calculate_total_requests,
    calculate_total_tokens,
    validate_currency,
    validate_report_id,
)


def create_entries() -> list[CostReportEntry]:
    return [
        CostReportEntry(
            entity_type="project",
            entity_id="project-a",
            amount=Decimal("10.00"),
            currency="USD",
            model="slm-model",
            provider="provider-a",
            request_count=10,
            token_count=5000,
        ),
        CostReportEntry(
            entity_type="project",
            entity_id="project-a",
            amount=Decimal("20.00"),
            currency="USD",
            model="mlm-model",
            provider="provider-b",
            request_count=20,
            token_count=10000,
        ),
        CostReportEntry(
            entity_type="project",
            entity_id="project-b",
            amount=Decimal("30.00"),
            currency="USD",
            model="llm-model",
            provider="provider-a",
            request_count=30,
            token_count=15000,
        ),
    ]


def test_utils() -> None:
    entries = create_entries()

    assert calculate_total_cost(entries) == Decimal(
        "60.00"
    )

    assert calculate_total_requests(entries) == 60

    assert calculate_total_tokens(entries) == 30000

    assert calculate_cost_share(
        Decimal("15"),
        Decimal("60"),
    ) == Decimal("25")

    assert validate_report_id(
        " report-001 "
    ) == "report-001"

    assert validate_currency(
        "usd"
    ) == "USD"

    print("COST REPORTING UTILITIES: PASS")


def test_aggregator() -> None:
    entries = create_entries()
    aggregator = CostAggregator()

    summary = aggregator.aggregate(entries)

    assert summary.total_cost == Decimal("60.00")
    assert summary.total_requests == 60
    assert summary.total_tokens == 30000

    model_reports = aggregator.by_model(entries)

    assert model_reports["slm-model"].total_cost == (
        Decimal("10.00")
    )

    assert model_reports["mlm-model"].total_cost == (
        Decimal("20.00")
    )

    provider_reports = aggregator.by_provider(entries)

    assert provider_reports["provider-a"].total_cost == (
        Decimal("40.00")
    )

    entity_reports = aggregator.by_entity(entries)

    assert entity_reports[
        ("project", "project-a")
    ].total_cost == Decimal("30.00")

    print("COST REPORT AGGREGATION: PASS")


def test_reporter() -> None:
    entries = create_entries()
    reporter = CostReporter()

    report = reporter.generate(
        report_id="report-001",
        entries=entries,
    )

    assert report.report_id == "report-001"
    assert report.total_cost == Decimal("60.00")
    assert report.total_requests == 60
    assert report.total_tokens == 30000
    assert len(report.entries) == 3

    summary = reporter.summarize(
        entries=entries,
        model="slm-model",
    )

    assert summary.total_cost == Decimal("10.00")
    assert summary.total_requests == 10

    by_model = reporter.by_model(entries)

    assert len(by_model) == 3

    by_provider = reporter.by_provider(entries)

    assert len(by_provider) == 2

    by_entity = reporter.by_entity(entries)

    assert len(by_entity) == 2

    print("COST REPORTER: PASS")


def test_exporter() -> None:
    entries = create_entries()
    reporter = CostReporter()
    exporter = CostReportExporter()

    report = reporter.generate(
        report_id="report-001",
        entries=entries,
    )

    report_data = exporter.report_to_dict(report)

    assert report_data["report_id"] == "report-001"
    assert report_data["total_cost"] == "60.00"
    assert report_data["total_requests"] == 60
    assert report_data["total_tokens"] == 30000
    assert len(report_data["entries"]) == 3

    summary = reporter.summarize(entries)

    summary_data = exporter.summary_to_dict(summary)

    assert summary_data["total_cost"] == "60.00"
    assert summary_data["currency"] == "USD"

    entry_data = exporter.entry_to_dict(
        entries[0]
    )

    assert entry_data["amount"] == "10.00"
    assert entry_data["model"] == "slm-model"

    print("COST REPORT EXPORTER: PASS")


def test_filtering() -> None:
    entries = create_entries()
    aggregator = CostAggregator()

    project_summary = aggregator.aggregate(
        entries=entries,
        entity_type="project",
        entity_id="project-a",
    )

    assert project_summary.total_cost == Decimal(
        "30.00"
    )

    provider_summary = aggregator.aggregate(
        entries=entries,
        provider="provider-a",
    )

    assert provider_summary.total_cost == Decimal(
        "40.00"
    )

    model_summary = aggregator.aggregate(
        entries=entries,
        model="llm-model",
    )

    assert model_summary.total_cost == Decimal(
        "30.00"
    )

    print("COST REPORT FILTERING: PASS")


def main() -> None:
    test_utils()
    test_aggregator()
    test_reporter()
    test_exporter()
    test_filtering()

    print("COST REPORTING: PASS")


if __name__ == "__main__":
    main()
