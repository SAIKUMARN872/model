def seasonality_factor(period_index: int, period_length: int = 7) -> float:
    if period_length <= 0:
        raise ValueError("period_length must be greater than zero.")
    position = period_index % period_length
    center = (period_length - 1) / 2
    distance = abs(position - center) / max(1.0, center)
    return 1.0 + (1.0 - distance) * 0.1
