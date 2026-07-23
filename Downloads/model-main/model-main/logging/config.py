"""
Logging Configuration

Contains centralized logging settings.
"""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class LoggingSettings(BaseSettings):
    """
    Logging environment configuration.
    """

    LOG_LEVEL: str = "INFO"

    LOG_FILE: str = "logs/app.log"

    LOG_FORMAT: str = (
        "%(asctime)s | "
        "%(levelname)s | "
        "%(name)s | "
        "%(message)s"
    )

    ENABLE_FILE_LOGGING: bool = True

    ENABLE_CONSOLE_LOGGING: bool = True


    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


logging_settings = LoggingSettings()


# Create log directory

log_path = Path(
    logging_settings.LOG_FILE
)

log_path.parent.mkdir(
    parents=True,
    exist_ok=True
)