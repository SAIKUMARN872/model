from dataclasses import dataclass
from typing import Optional

@dataclass(frozen=True)
class ForecastResult:
    predicted_value: float
    confidence: float = 0.0
    horizon: Optional[str] = None
