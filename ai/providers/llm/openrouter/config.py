@'
from dataclasses import dataclass
import os


@dataclass(frozen=True)
class OpenRouterConfig:
    api_key: str
    base_url: str = "https://openrouter.ai/api/v1"
    timeout_seconds: float = 120.0
    max_retries: int = 3
    http_referer: str = ""
    x_title: str = "ModelNow"

    @classmethod
    def from_env(cls) -> "OpenRouterConfig":
        return cls(
            api_key=os.getenv("OPENROUTER_API_KEY", ""),
            base_url=os.getenv(
                "OPENROUTER_BASE_URL",
                "https://openrouter.ai/api/v1",
            ).rstrip("/"),
            timeout_seconds=float(
                os.getenv(
                    "OPENROUTER_TIMEOUT_SECONDS",
                    "120",
                )
            ),
            max_retries=int(
                os.getenv(
                    "OPENROUTER_MAX_RETRIES",
                    "3",
                )
            ),
            http_referer=os.getenv(
                "OPENROUTER_HTTP_REFERER",
                "",
            ),
            x_title=os.getenv(
                "OPENROUTER_X_TITLE",
                "ModelNow",
            ),
        )
'@ | Set-Content .\ai\providers\llm\openrouter\config.py