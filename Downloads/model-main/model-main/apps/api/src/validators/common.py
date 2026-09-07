from app.validators.common import (
    validate_required,
    validate_length,
    validate_range,
)


validate_required(
    "OpenAI",
    "provider",
)

validate_length(
    "gpt-4",
    min_length=3,
    max_length=50,
    field_name="model",
)

validate_range(
    0.7,
    minimum=0,
    maximum=2,
    field_name="temperature",
)