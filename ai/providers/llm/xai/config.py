@'
from dataclasses import dataclass
import os


@dataclass(frozen=True)
class XAIConfig:
    api_key: str
    base_url: str = "https://api.x.ai"
    timeout_seconds: float = 120.0
    max_retries: int = 3

    @classmethod
    def from_env(cls) -> "XAIConfig":
        return cls(
            api_key=os.getenv("XAI_API_KEY", ""),
            base_url=os.getenv(
                "XAI_BASE_URL",
                "https://api.x.ai",
            ).rstrip("/"),
            timeout_seconds=float(
                os.getenv("XAI_TIMEOUT_SECONDS", "120")
            ),
            max_retries=int(
                os.getenv("XAI_MAX_RETRIES", "3")
            ),
        )
'@ | Set-Content .\ai\providers\llm\xai\config.py