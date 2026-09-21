@'
from dataclasses import dataclass
import os


@dataclass(frozen=True)
class MistralConfig:
    api_key: str
    base_url: str = "https://api.mistral.ai"
    timeout_seconds: float = 60.0
    max_retries: int = 3

    @classmethod
    def from_env(cls) -> "MistralConfig":
        return cls(
            api_key=os.getenv("MISTRAL_API_KEY", ""),
            base_url=os.getenv(
                "MISTRAL_BASE_URL",
                "https://api.mistral.ai",
            ).rstrip("/"),
            timeout_seconds=float(
                os.getenv("MISTRAL_TIMEOUT_SECONDS", "60")
            ),
            max_retries=int(
                os.getenv("MISTRAL_MAX_RETRIES", "3")
            ),
        )
'@ | Set-Content .\ai\providers\llm\mistral\config.py