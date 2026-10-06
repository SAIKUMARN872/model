from decimal import Decimal

from .exceptions import (
    InvalidQuotaRequestError,
    QuotaExceededError,
    QuotaNotFoundError,
)
from .manager import QuotaManager
from .models import QuotaAccount
from .tracker import QuotaTracker


def run_test() -> None:
    manager = QuotaManager()

    quota = manager.create_quota(
        quota_id="enterprise-tokens",
        limit=10000,
        unit="tokens",
        owner_id="enterprise-001",
        period="monthly",
    )

    assert isinstance(quota, QuotaAccount)
    assert quota.limit == 10000
    assert quota.used == 0
    assert quota.remaining == 10000

    check = manager.check(
        quota_id="enterprise-tokens",
        requested=2000,
    )

    assert check.limit == 10000
    assert check.used == 0
    assert check.requested == 2000
    assert check.remaining == 8000
    assert check.utilization == Decimal("0.2")
    assert check.exceeded is False

    tracker = QuotaTracker(manager)

    usage = tracker.record(
        quota_id="enterprise-tokens",
        amount=7000,
        request_id="req-001",
        model="test-model",
        provider="test-provider",
    )

    assert usage.amount == 7000

    assert tracker.get_usage(
        "enterprise-tokens"
    ) == 7000

    assert tracker.get_remaining(
        "enterprise-tokens"
    ) == 3000

    utilization = tracker.get_utilization(
        "enterprise-tokens"
    )

    assert utilization == Decimal("0.7")

    warning_check = manager.check(
        quota_id="enterprise-tokens",
        requested=1500,
    )

    assert warning_check.utilization == Decimal("0.85")
    assert warning_check.exceeded is False

    manager.consume(
        quota_id="enterprise-tokens",
        amount=2000,
        request_id="req-002",
        model="test-model",
        provider="test-provider",
    )

    assert manager.get_used(
        "enterprise-tokens"
    ) == 9000

    assert manager.get_remaining(
        "enterprise-tokens"
    ) == 1000

    try:
        manager.consume(
            quota_id="enterprise-tokens",
            amount=2000,
        )
    except QuotaExceededError:
        pass
    else:
        raise AssertionError(
            "Quota exceeding usage should be rejected"
        )

    try:
        manager.consume(
            quota_id="enterprise-tokens",
            amount=0,
        )
    except InvalidQuotaRequestError:
        pass
    else:
        raise AssertionError(
            "Zero usage should be rejected"
        )

    try:
        manager.get_quota(
            "missing-quota"
        )

        manager.require_quota(
            "missing-quota"
        )
    except QuotaNotFoundError:
        pass
    else:
        raise AssertionError(
            "Missing quota should raise QuotaNotFoundError"
        )

    try:
        manager.create_quota(
            quota_id="invalid-quota",
            limit=0,
        )
    except ValueError:
        pass
    else:
        raise AssertionError(
            "Zero quota limit should be rejected"
        )

    records = tracker.list_records(
        "enterprise-tokens"
    )

    assert len(records) == 2

    print("QUOTA CREATION: PASS")
    print("QUOTA CHECK: PASS")
    print("QUOTA TRACKING: PASS")
    print("QUOTA CONSUMPTION: PASS")
    print("QUOTA UTILIZATION: PASS")
    print("QUOTA LIMIT PROTECTION: PASS")
    print("QUOTA ERROR HANDLING: PASS")
    print("QUOTA MANAGER: PASS")


if __name__ == "__main__":
    run_test()
