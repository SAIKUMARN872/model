from __future__ import annotations

import json
from typing import Any


class ResponseSerializer:
    """Serialize formatted inference responses."""

    def to_dict(
        self,
        response: dict[str, Any],
    ) -> dict[str, Any]:
        return dict(response)

    def to_json(
        self,
        response: dict[str, Any],
    ) -> str:
        return json.dumps(
            response,
            ensure_ascii=False,
        )
