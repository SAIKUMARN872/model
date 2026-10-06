def validate_quota(limit: float, used: float = 0.0) -> None:
    if limit < 0:
        raise ValueError("quota limit cannot be negative.")
    if used < 0:
        raise ValueError("quota usage cannot be negative.")
