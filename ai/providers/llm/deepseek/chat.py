cd "C:\Users\pamar\Downloads\model-main\model-main"

@'
import time

from ai.providers.base.request import ChatRequest
from ai.providers.base.response import ChatResponse, ChatUsage

from .client import DeepSeekClient


class DeepSeekChat:

    def __init__(self, client: DeepSeekClient):
        self.client = client

    async def generate(
        self,
        request: ChatRequest,
    ) -> ChatResponse:

        messages = [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in request.messages
        ]

        kwargs = {}

        if request.temperature is not None:
            kwargs["temperature"] = request.temperature

        if request.max_tokens is not None:
            kwargs["max_tokens"] = request.max_tokens

        if request.top_p is not None:
            kwargs["top_p"] = request.top_p

        if request.stop is not None:
            kwargs["stop"] = request.stop

        if request.tools:
            kwargs["tools"] = [
                tool.model_dump()
                if hasattr(tool, "model_dump")
                else tool
                for tool in request.tools
            ]

        if request.tool_choice is not None:
            kwargs["tool_choice"] = request.tool_choice

        if request.response_format is not None:
            kwargs["response_format"] = request.response_format

        if request.seed is not None:
            kwargs["seed"] = request.seed

        started = time.perf_counter()

        response = await self.client.request(
            model=request.model,
            messages=messages,
            **kwargs,
        )

        latency_ms = (
            time.perf_counter() - started
        ) * 1000

        choice = response.choices[0]
        message = choice.message

        usage = getattr(
            response,
            "usage",
            None,
        )

        input_tokens = (
            getattr(
                usage,
                "prompt_tokens",
                0,
            )
            if usage
            else 0
        )

        output_tokens = (
            getattr(
                usage,
                "completion_tokens",
                0,
            )
            if usage
            else 0
        )

        total_tokens = (
            getattr(
                usage,
                "total_tokens",
                0,
            )
            if usage
            else input_tokens + output_tokens
        )

        tool_calls = []

        if getattr(
            message,
            "tool_calls",
            None,
        ):
            for tool_call in message.tool_calls:

                if hasattr(
                    tool_call,
                    "model_dump",
                ):
                    tool_calls.append(
                        tool_call.model_dump()
                    )
                else:
                    tool_calls.append(
                        tool_call
                    )

        return ChatResponse(
            provider="deepseek",
            model=request.model,
            content=message.content or "",
            usage=ChatUsage(
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                total_tokens=total_tokens,
            ),
            latency_ms=latency_ms,
            finish_reason=getattr(
                choice,
                "finish_reason",
                None,
            ),
            request_id=str(
                request.request_id
            ),
            tool_calls=tool_calls,
            raw_response=response,
        )
'@ | Set-Content ".\ai\providers\llm\deepseek\chat.py" -Encoding UTF8