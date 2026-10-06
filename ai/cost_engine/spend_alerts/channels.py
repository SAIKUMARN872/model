from dataclasses import dataclass
from typing import Literal

Channel = Literal["email", "webhook", "console"]

@dataclass(frozen=True)
class AlertChannel:
    name: str
    enabled: bool = True

DEFAULT_CHANNELS = (
    AlertChannel("console"),
)
