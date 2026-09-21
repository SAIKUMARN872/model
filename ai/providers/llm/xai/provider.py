@'
from typing import Iterator

from ai.providers.base.provider import BaseProvider
from ai.providers.base.request import ProviderRequest
from ai.providers.base.response import ProviderResponse
from ai.providers.exceptions import (
    ProviderAuthenticationError,
    ProviderExecutionError,
    ProviderRateLimitError,
    ProviderTimeoutError,
    ProviderUnavailableError,
)

from .chat import XAIChat
from .client import (
    XAIAuthenticationError,
    XAIClient,
    XAIClientError,
    XAIAuthorizationError,
    XAIRateLimitError,
    XAITimeoutError,
    XAIUnavailableError,
)
from .config import XAIConfig
from .stream import XAIStream


class XAIProvider(BaseProvider):
    provider_id = "xai"

    def __init__(
        self,
        config: XAIConfig | None = None,
    ):
        self.config = config or XAIConfig.from_env()

        self.client = XAIClient(
            self.config
        )

        self.chat = XAIChat(
            self.client
        )

        self.stream_client = XAIStream(
            self.client
        )

    def generate(
        self,
        request: ProviderRequest,
    ) -> ProviderResponse:

        try:
            return self.chat.generate(
                request
            )

        except XAIAuthenticationError as exc:
            raise ProviderAuthenticationError(
                str(exc)
            ) from exc

        except XAIAuthorizationError as exc:
            raise ProviderAuthenticationError(
                str(exc)
            ) from exc

        except XAIRateLimitError as exc:
            raise ProviderRateLimitError(
                str(exc)
            ) from exc

        except XAITimeoutError as exc:
            raise ProviderTimeoutError(
                str(exc)
            ) from exc

        except XAIUnavailableError as exc:
            raise ProviderUnavailableError(
                str(exc)
            ) from exc

        except XAIClientError as exc:
            raise ProviderExecutionError(
                str(exc)
            ) from exc

    def stream(
        self,
        request: ProviderRequest,
    ) -> Iterator[str]:

        try:
            yield from self.stream_client.generate(
                request
            )

        except XAIAuthenticationError as exc:
            raise ProviderAuthenticationError(
                str(exc)
            ) from exc

        except XAIAuthorizationError as exc:
            raise ProviderAuthenticationError(
                str(exc)
            ) from exc

        except XAIRateLimitError as exc:
            raise ProviderRateLimitError(
                str(exc)
            ) from exc

        except XAITimeoutError as exc:
            raise ProviderTimeoutError(
                str(exc)
            ) from exc

        except XAIUnavailableError as exc:
            raise ProviderUnavailableError(
                str(exc)
            ) from exc

        except XAIClientError as exc:
            raise ProviderExecutionError(
                str(exc)
            ) from exc

    def health_check(self):
        return self.client.health_check()
'@ | Set-Content .\ai\providers\llm\xai\provider.py