from typing import Any

from ..results.status import VerificationStatus
from ..results.verification_result import VerificationResult
from ..validator import validate_expectation


async def verify_page(
    page: Any,
    expectation: dict[str, Any],
) -> VerificationResult:
    """Verify observable page conditions using read-only browser inspection."""
    try:
        conditions = validate_expectation(expectation)
    except (TypeError, ValueError) as exc:
        return VerificationResult(
            VerificationStatus.INCONCLUSIVE,
            "page",
            f"Invalid page expectation: {exc}",
        )

    if page is None:
        return VerificationResult(
            VerificationStatus.INCONCLUSIVE,
            "page",
            "No browser page was supplied.",
        )

    evidence: list[dict[str, Any]] = []
    failures: list[str] = []
    unknown: list[str] = []

    try:
        if "url_contains" in conditions:
            url = getattr(page, "url", None)
            if callable(url):
                url = await url()
            if not isinstance(url, str):
                unknown.append("Current page URL is unavailable.")
            else:
                matched = conditions["url_contains"] in url
                evidence.append({
                    "check": "url_contains",
                    "expected": conditions["url_contains"],
                    "observed": url,
                    "matched": matched,
                })
                if not matched:
                    failures.append("The current URL did not match.")

        if "title_contains" in conditions:
            title = await page.title()
            if not isinstance(title, str):
                unknown.append("Page title is unavailable.")
            else:
                matched = conditions["title_contains"] in title
                evidence.append({
                    "check": "title_contains",
                    "expected": conditions["title_contains"],
                    "observed": title,
                    "matched": matched,
                })
                if not matched:
                    failures.append("The page title did not match.")

        if "text_contains" in conditions:
            body = page.locator("body")
            text = await body.inner_text()
            if not isinstance(text, str):
                unknown.append("Page text is unavailable.")
            else:
                matched = conditions["text_contains"] in text
                evidence.append({
                    "check": "text_contains",
                    "expected": conditions["text_contains"],
                    "matched": matched,
                })
                if not matched:
                    failures.append("Expected text was not found.")

        for key, expected_visible in (
            ("selector_visible", True),
            ("selector_hidden", False),
        ):
            if key not in conditions:
                continue

            selector = conditions[key]
            locator = page.locator(selector)
            visible = await locator.is_visible()
            matched = bool(visible) is expected_visible
            evidence.append({
                "check": key,
                "selector": selector,
                "expected_visible": expected_visible,
                "observed_visible": bool(visible),
                "matched": matched,
            })
            if not matched:
                failures.append(f"Visibility condition failed for {selector!r}.")

    except Exception:
        return VerificationResult(
            VerificationStatus.INCONCLUSIVE,
            "page",
            "Page inspection failed; the expected outcome could not be verified.",
            evidence,
        )

    if failures:
        return VerificationResult(
            VerificationStatus.FAILED,
            "page",
            " ".join(failures),
            evidence,
        )

    if unknown:
        return VerificationResult(
            VerificationStatus.INCONCLUSIVE,
            "page",
            " ".join(unknown),
            evidence,
        )

    return VerificationResult(
        VerificationStatus.PASSED,
        "page",
        "All expected page conditions were observed.",
        evidence,
    )
