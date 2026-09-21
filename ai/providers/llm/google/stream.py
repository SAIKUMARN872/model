@'
from __future__ import annotations

from typing import Dict, Iterator

from ...base.request import ProviderRequest

from .client import GoogleClient
from .utils import build_generate_payload


class GoogleStream:
    def __init__(
        self,
        client: GoogleClient,
    ):
        self.client = client

    def generate(
        self,
        request: ProviderRequest,
    ) -> Iterator[str]:
        payload = build_generate_payload(
            messages=request.messages,
            temperature=request.temperature,
            max_output_tokens=request.max_tokens,
            tools=request.tools,
            metadata=request.metadata,
        )

        for event in self.client.stream(
            request.model,
            payload,
        ):
            yield from self._extract_text(
                event
            )

    @staticmethod
    def _extract_text(
        event: Dict,
    ) -> Iterator[str]:
        candidates = event.get("candidates") or []

        for candidate in candidates:
            content = candidate.get("content") or {}
            parts = content.get("parts") or []

            for part in parts:
                if not isinstance(part, dict):
                    continue

                text = part.get("text")

                if isinstance(text, str) and text:
                    yield text
'@ | Set-Content ".\ai\providers\llm\google\stream.py" -Encoding UTF8