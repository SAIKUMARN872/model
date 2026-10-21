"""Builds reviewable plans; it does not execute browser actions."""

from .intent import classify_intent
from .models import AutomationDomain, AutomationIntent, AutomationPlan


_COMMON_STEPS = (
    "Validate the user's goal and required inputs.",
    "Discover an authorized provider or supported website.",
    "Open a permitted browser session and inspect available options.",
    "Extract real results and compare them against the user's constraints.",
    "Revalidate the selected option, availability, and total cost.",
    "Request explicit approval before a consequential transaction.",
    "Execute only the approved action through the authorized executor.",
    "Verify the resulting status and report evidence to the user.",
)


_DOMAIN_STEPS = {
    AutomationDomain.SHOPPING: (
        "Search products and compare price, specifications, ratings, and variants.",
        "Review shipping, taxes, stock, and the cart before purchase.",
    ),
    AutomationDomain.FOOD: (
        "Search restaurants and menu items; compare delivery time and total price.",
        "Review item customizations, delivery address, and order total.",
    ),
    AutomationDomain.TRAVEL: (
        "Search supported routes and compare schedules, fares, and travel policies.",
        "Verify passenger details, baggage rules, and itinerary before booking.",
    ),
    AutomationDomain.HOTEL: (
        "Search stays and compare location, room type, amenities, and cancellation terms.",
        "Verify guest count, dates, availability, and total stay price.",
    ),
    AutomationDomain.MOVIE: (
        "Search films, venues, showtimes, seat availability, and ticket prices.",
        "Verify the selected show, seats, and final ticket total.",
    ),
    AutomationDomain.EXAM_APPLICATION: (
        "Discover the official exam portal and verify the application period.",
        "Identify required details and documents; ask the user for missing information.",
        "Fill the form using user-provided information and review it before submission.",
        "Require explicit approval before final submission or payment.",
        "Verify the official application status and preserve the acknowledgement.",
    ),
    AutomationDomain.BOOKING: (
        "Discover supported booking providers and compare available options.",
        "Verify the appointment, reservation, or event details before submission.",
    ),
    AutomationDomain.GENERAL: (
        "Determine the required website interactions and whether the task is supported.",
    ),
}


class AutomationPlanner:
    """Convert a natural-language prompt into a typed, reviewable plan."""

    def plan(self, prompt: str) -> AutomationPlan:
        intent: AutomationIntent = classify_intent(prompt)
        steps = _DOMAIN_STEPS[intent.domain] + _COMMON_STEPS

        notes = [
            "This is a proposed plan, not evidence that a website action occurred.",
            "Execution requires a supported provider, validated actions, and authorized user context.",
        ]
        if intent.needs_clarification:
            notes.append("Resolve clarification questions before execution.")

        return AutomationPlan(
            intent=intent,
            steps=steps,
            requires_user_approval=True,
            execution_ready=False,
            notes=tuple(notes),
        )


def plan_automation(prompt: str) -> AutomationPlan:
    return AutomationPlanner().plan(prompt)
