"""Rule-based first-pass classifier for natural-language automation prompts."""

import re

from .models import AutomationDomain, AutomationIntent


_DOMAIN_TERMS = {
    AutomationDomain.SHOPPING: (
        "shopping", "shop", "buy", "purchase", "laptop",
        "phone", "shoes", "clothes", "e-commerce", "ecommerce", "cart",
        "order online", "buy online", "add to cart", "product listing",
    ),
    AutomationDomain.FOOD: (
        "food delivery", "deliver food", "restaurant", "menu", "biryani",
        "pizza", "burger", "order food", "meal", "takeaway",
    ),
    AutomationDomain.TRAVEL: (
        "flight", "flights", "airline", "train", "bus ticket",
        "travel", "trip", "transport", "airfare",
    ),
    AutomationDomain.HOTEL: (
        "hotel", "hotels", "accommodation", "room booking", "resort",
        "check-in", "check in", "check-out", "check out",
    ),
    AutomationDomain.MOVIE: (
        "movie", "movies", "cinema", "theatre", "theater",
        "movie ticket", "showtime", "film tickets",
    ),
    AutomationDomain.EXAM_APPLICATION: (
        "exam application", "apply for exam", "exam registration",
        "entrance exam", "application form", "admission application",
        "ap exam", "ap emcet", "eapcet", "eamcet",
    ),
    AutomationDomain.BOOKING: (
        "appointment", "book an event", "event ticket", "book a table",
        "reservation", "book a service",
    ),
}


def classify_intent(prompt: str) -> AutomationIntent:
    if not isinstance(prompt, str) or not prompt.strip():
        raise ValueError("Prompt must be a non-empty string.")

    normalized = " ".join(prompt.lower().split())
    scores: dict[AutomationDomain, list[str]] = {}

    for domain, terms in _DOMAIN_TERMS.items():
        matches = [term for term in terms if term in normalized]
        if matches:
            scores[domain] = matches

    if not scores:
        domain = AutomationDomain.GENERAL
        matched_terms: tuple[str, ...] = ()
        confidence = 0.35
    else:
        # Prefer the domain with the most distinct matching terms.
        # Ties use a deterministic domain-name order.
        domain, matches = sorted(
            scores.items(),
            key=lambda item: (-len(item[1]), item[0].value),
        )[0]
        matched_terms = tuple(matches)
        confidence = min(0.95, 0.55 + 0.10 * len(matches))

    constraints: dict[str, object] = {}

    budget_match = re.search(
        r"(?:under|below|within|budget(?: of)?|maximum|max\.?)\s*"
        r"(?:₹|rs\.?\s*|inr\s*|\$)?\s*([\d,]+(?:\.\d{1,2})?)",
        normalized,
    )
    if budget_match:
        constraints["budget"] = float(
            budget_match.group(1).replace(",", "")
        )

    route_match = re.search(
        r"\bfrom\s+(.+?)\s+to\s+(.+?)(?=,\s|\s+on\s|\s+for\s|\s+under\s|\s+today\b|\s+tomorrow\b|\s+tonight\b|\s+this weekend\b|\s+next week\b|\s+next month\b|$)",
        prompt,
        flags=re.IGNORECASE,
    )
    if route_match and domain == AutomationDomain.TRAVEL:
        constraints["origin"] = route_match.group(1).strip(" .")
        constraints["destination"] = route_match.group(2).strip(" .")

    date_terms = (
        "today", "tomorrow", "tonight", "this weekend",
        "next week", "next month",
    )
    for term in date_terms:
        if term in normalized:
            constraints["date_phrase"] = term
            break

    questions: list[str] = []
    if domain in {AutomationDomain.TRAVEL, AutomationDomain.HOTEL}:
        if "date_phrase" not in constraints:
            questions.append("What are your travel or stay dates?")
    if domain == AutomationDomain.MOVIE:
        if "date_phrase" not in constraints:
            questions.append("Which date would you like to attend?")
    if domain == AutomationDomain.FOOD:
        if not any(word in normalized for word in (
            "near me", "nearby", "my address", "deliver to",
            "delivery address",
        )):
            questions.append("What delivery location should be used?")
    if domain == AutomationDomain.GENERAL:
        questions.append(
            "What would you like ModelNow to accomplish in the browser?"
        )

    return AutomationIntent(
        original_prompt=prompt.strip(),
        domain=domain,
        confidence=confidence,
        matched_terms=matched_terms,
        constraints=constraints,
        needs_clarification=bool(questions),
        clarification_questions=tuple(questions),
    )
