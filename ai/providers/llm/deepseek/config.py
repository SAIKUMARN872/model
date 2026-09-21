

@'
from dataclasses import dataclass
import os


@dataclass
class DeepSeekConfig:
    api_key: str | None = None
    base_url: str = "https://api.deepseek.com"
    timeout: float = 60.0
    max_retries: int = 2

    def __post_init__(self):
        if self.api_key is None:
            self.api_key = os.getenv("DEEPSEEK_API_KEY")

    @property
    def client_kwargs(self) -> dict:
        return {
            "api_key": self.api_key or "",
            "base_url": self.base_url,
            "timeout": self.timeout,
            "max_retries": self.max_retries,
        }
'@ | Set-Content ".\ai\providers\llm\deepseek\config.py" -Encoding UTF8