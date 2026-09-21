cd "C:\Users\pamar\Downloads\model-main\model-main"

@'
from .chat import DeepSeekChat

from .client import (
    DeepSeekAuthenticationError,
    DeepSeekClient,
    DeepSeekClientError,
    DeepSeekRateLimitError,
    DeepSeekRequestError,
    DeepSeekTimeoutError,
    DeepSeekUnavailableError,
)

from .config import DeepSeekConfig

from .models import (
    DEEPSEEK_MODELS,
    DeepSeekModelInfo,
    get_model,
    supported_models,
)

from .provider import DeepSeekProvider
from .stream import DeepSeekStream
from .tokenizer import DeepSeekTokenizer


__all__ = [
    "DeepSeekChat",
    "DeepSeekClient",
    "DeepSeekClientError",
    "DeepSeekAuthenticationError",
    "DeepSeekRateLimitError",
    "DeepSeekRequestError",
    "DeepSeekTimeoutError",
    "DeepSeekUnavailableError",
    "DeepSeekConfig",
    "DeepSeekModelInfo",
    "DEEPSEEK_MODELS",
    "get_model",
    "supported_models",
    "DeepSeekProvider",
    "DeepSeekStream",
    "DeepSeekTokenizer",
]
'@ | Set-Content ".\ai\providers\llm\deepseek\__init__.py" -Encoding UTF8