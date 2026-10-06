from statistics import mean

def predict_next(values: list[float]) -> float:
    if not values:
        return 0.0
    if len(values) == 1:
        return float(values[0])
    recent = values[-5:]
    return float(mean(recent))
