from __future__ import annotations

from typing import Any

from ai.inference_engine.models import InferenceRequest


class RequestParser:
    """Normalize external request dictionaries."""

    def parse(
        self,
        data: dict[str, Any],
    ) -> InferenceRequest:
        if not isinstance(data, dict):
            raise TypeError(
                "Inference request data must be a dictionary."
            )

        if "model" not in data:
            raise ValueError(
                "Inference request is missing model."
            )

        if "messages" not in data:
            raise ValueError(
                "Inference request is missing messages."
            )

        messages = [
            dict(message)
            for message in data["messages"]
        ]

        tools = data.get("tools")

        return InferenceRequest(
            model=str(data["model"]),
            messages=messages,
            temperature=data.get("temperature"),
            max_tokens=data.get("max_tokens"),
            top_p=data.get("top_p"),
            stream=bool(data.get("stream", False)),
            tools=(
                [dict(tool) for tool in tools]
                if tools is not None
                else None
            ),
            response_format=(
                dict(data["response_format"])
                if data.get("response_format") is not None
                else None
            ),
            stop=(
                list(data["stop"])
                if isinstance(data.get("stop"), list)
                else data.get("stop")
            ),
            seed=data.get("seed"),
            request_id=data.get("request_id"),
            metadata=dict(
                data.get("metadata", {})
            ),
        )


__all__ = ["RequestParser"]
