@'
import json
from typing import Iterator

from ai.providers.base.request import ProviderRequest

from .client import XAIClient
from .utils import build_response_payload


class XAIStream:
    def __init__(self, client: XAIClient):
        self.client = client

    def generate(
        self,
        request: ProviderRequest,
    ) -> Iterator[str]:

        payload = build_response_payload(
            model=request.model,
            messages=request.messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            stream=True,
            tools=request.tools,
            metadata=request.metadata,
        )

        raw_stream = self.client.stream_responses(
            payload
        )

        for block in raw_stream.split("\n\n"):
            event_name = None
            data_lines = []

            for line in block.splitlines():
                if line.startswith("event:"):
                    event_name = line[
                        len("event:"):
                    ].strip()

                elif line.startswith("data:"):
                    data_lines.append(
                        line[len("data:"):].strip()
                    )

            if not data_lines:
                continue

            raw_data = "\n".join(data_lines)

            if raw_data == "[DONE]":
                break

            try:
                event = json.loads(raw_data)
            except json.JSONDecodeError:
                continue

            event_type = (
                event.get("type")
                or event_name
            )

            if event_type in {
                "response.output_text.delta",
                "response.text.delta",
            }:
                delta = event.get("delta", "")

                if isinstance(delta, str) and delta:
                    yield delta
'@ | Set-Content .\ai\providers\llm\xai\stream.py