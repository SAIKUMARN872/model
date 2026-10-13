"""Input validation for accuracy evaluation."""


def validate_accuracy_input(prediction, reference):
    if not isinstance(prediction, str):
        raise ValueError("prediction must be a string")
    if not isinstance(reference, str):
        raise ValueError("reference must be a string")
    return True


def validate_accuracy_batch(predictions, references):
    if isinstance(predictions, (str, bytes)) or isinstance(references, (str, bytes)):
        raise ValueError("predictions and references must be sequences")
    if len(predictions) != len(references):
        raise ValueError("predictions and references must have equal lengths")
    if not predictions:
        raise ValueError("at least one prediction is required")
    for prediction, reference in zip(predictions, references):
        validate_accuracy_input(prediction, reference)
    return True
