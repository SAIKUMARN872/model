@'
from dataclasses import dataclass
import os


@dataclass(frozen=True)
class CohereConfig:
    api_key: str
    base_url: str = "https://api.cohere.com"
    timeout_seconds: float = 120.0
    max_retries: int = 3
    client_name: str = "modelnow"

    @classmethod
    def from_env(cls) -> "CohereConfig":
        return cls(
            api_key=os.getenv("COHERE_API_KEY", ""),
            base_url=os.getenv(
                "COHERE_BASE_URL",
                "https://api.cohere.com",
            ).rstrip("/"),
            timeout_seconds=float(
                os.getenv("COHERE_TIMEOUT_SECONDS", "120")
            ),
            max_retries=int(
                os.getenv("COHERE_MAX_RETRIES", "3")
            ),
            client_name=os.getenv(
                "COHERE_CLIENT_NAME",
                "modelnow",
            ),
        )
'@ | Set-Content .\ai\providers\llm\cohere\config.py