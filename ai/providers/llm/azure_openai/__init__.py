cd "C:\Users\pamar\Downloads\model-main\model-main"

@'
from .config import AzureOpenAIConfig
from .models import AzureDeployment
from .client import AzureOpenAIClient
from .provider import AzureOpenAIProvider
from .tokenizer import (
    AzureOpenAITokenizer,
    estimate_azure_tokens,
)
from .chat import (
    build_chat_payload,
    parse_chat_response,
)
from .stream import (
    build_stream_payload,
    parse_sse_line,
    parse_sse_stream,
)

__all__ = [
    "AzureOpenAIConfig",
    "AzureDeployment",
    "AzureOpenAIClient",
    "AzureOpenAIProvider",
    "AzureOpenAITokenizer",
    "estimate_azure_tokens",
    "build_chat_payload",
    "parse_chat_response",
    "build_stream_payload",
    "parse_sse_line",
    "parse_sse_stream",
]
'@ | Set-Content ".\ai\providers\llm\azure_openai\__init__.py" -Encoding UTF8