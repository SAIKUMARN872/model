"""Usage analytics derived from actual prompt history events."""

from collections import Counter
from typing import Any

from .history import PromptHistory


class PromptHistoryAnalytics:
    def __init__(self, history: PromptHistory) -> None:
        self.history = history

    def summary(
        self,
        tenant_id: str,
        prompt_id: str | None = None,
    ) -> dict[str, Any]:
        events = self.history.list_events(
            tenant_id=tenant_id,
            prompt_id=prompt_id,
        )

        event_counts = dict(sorted(Counter(
            event.event_type for event in events
        ).items()))

        prompt_counts = dict(sorted(Counter(
            event.prompt_id for event in events
        ).items()))

        return {
            "tenant_id": tenant_id,
            "total_events": len(events),
            "unique_prompts": len(prompt_counts),
            "event_counts": event_counts,
            "prompt_counts": prompt_counts,
        }

    def most_active_prompts(
        self,
        tenant_id: str,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        if isinstance(limit, bool) or not isinstance(limit, int):
            raise TypeError("limit must be an integer.")
        if limit < 1:
            raise ValueError("limit must be greater than zero.")

        summary = self.summary(tenant_id)
        ranked = [
            {"prompt_id": prompt_id, "event_count": count}
            for prompt_id, count in summary["prompt_counts"].items()
        ]
        ranked.sort(key=lambda item: (-item["event_count"], item["prompt_id"]))
        return ranked[:limit]
