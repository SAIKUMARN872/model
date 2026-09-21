cd "C:\Users\pamar\Downloads\model-main\model-main"

@'
from typing import Any

from openai import (
    APIConnectionError,
    APIError,
    APITimeoutError,
    AuthenticationError,
    AsyncOpenAI,
    RateLimitError,
)

from ai.providers.base.config import ProviderConfig

from .config import DeepSeekConfig


class DeepSeekClientError(Exception):
    """Base DeepSeek client error."""


class DeepSeekAuthenticationError(
    DeepSeekClientError
):
    """DeepSeek authentication error."""


class DeepSeekRateLimitError(
    DeepSeekClientError
):
    """DeepSeek rate-limit error."""


class DeepSeekRequestError(
    DeepSeekClientError
):
    """DeepSeek request error."""


class DeepSeekTimeoutError(
    DeepSeekClientError
):
    """DeepSeek timeout error."""


class DeepSeekUnavailableError(
    DeepSeekClientError
):
    """DeepSeek service unavailable error."""


class DeepSeekClient:

    def __init__(
        self,
        config: ProviderConfig,
    ):
        self.config = config
        self.deepseek_config = DeepSeekConfig()
        self._client: AsyncOpenAI | None = None

    @property
    def raw_client(self) -> AsyncOpenAI:

        if self._client is None:
            self._client = AsyncOpenAI(
                **self.deepseek_config.client_kwargs
            )

        return self._client

    async def request(
        self,
        model: str,
        messages: list[dict[str, Any]],
        **kwargs: Any,
    ) -> Any:

        try:
            return await self.raw_client.chat.completions.create(
                model=model,
                messages=messages,
                **kwargs,
            )

        except AuthenticationError as exc:
            raise DeepSeekAuthenticationError(
                "DeepSeek authentication failed."
            ) from exc

        except RateLimitError as exc:
            raise DeepSeekRateLimitError(
                "DeepSeek rate limit exceeded."
            ) from exc

        except APITimeoutError as exc:
            raise DeepSeekTimeoutError(
                "DeepSeek request timed out."
            ) from exc

        except APIConnectionError as exc:
            raise DeepSeekUnavailableError(
                "DeepSeek service is unavailable."
            ) from exc

        except APIError as exc:
            raise DeepSeekRequestError(
                f"DeepSeek API request failed: {exc}"
            ) from exc

    async def stream(
        self,
        model: str,
        messages: list[dict[str, Any]],
        **kwargs: Any,
    ) -> Any:

        try:
            return await self.raw_client.chat.completions.create(
                model=model,
                messages=messages,
                stream=True,
                **kwargs,
            )

        except AuthenticationError as exc:
            raise DeepSeekAuthenticationError(
                "DeepSeek authentication failed."
            ) from exc

        except RateLimitError as exc:
            raise DeepSeekRateLimitError(
                "DeepSeek rate limit exceeded."
            ) from exc

        except APITimeoutError as exc:
            raise DeepSeekTimeoutError(
                "DeepSeek request timed out."
            ) from exc

        except APIConnectionError as exc:
            raise DeepSeekUnavailableError(
                "DeepSeek service is unavailable."
            ) from exc

        except APIError as exc:
            raise DeepSeekRequestError(
                f"DeepSeek streaming request failed: {exc}"
            ) from exc

    async def close(self) -> None:

        if self._client is not None:
            await self._client.close()
            self._client = None
'@ | Set-Content ".\ai\providers\llm\deepseek\client.py" -Encoding UTF8