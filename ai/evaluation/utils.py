"""Evaluation metric utilities."""
import re
from collections import Counter

def tokenize(text: str) -> list[str]:
    return re.findall(r"\b[\w']+\b", text.casefold())

def exact_match(prediction: str, reference: str) -> bool:
    normalize = lambda value: " ".join(value.casefold().split())
    return normalize(prediction) == normalize(reference)

def token_f1(prediction: str, reference: str) -> float:
    predicted = tokenize(prediction)
    expected = tokenize(reference)
    if not predicted and not expected:
        return 1.0
    if not predicted or not expected:
        return 0.0
    overlap = sum((Counter(predicted) & Counter(expected)).values())
    if overlap == 0:
        return 0.0
    precision = overlap / len(predicted)
    recall = overlap / len(expected)
    return 2 * precision * recall / (precision + recall)

def lexical_context_overlap(answer: str, context: str) -> float:
    answer_tokens = set(tokenize(answer))
    context_tokens = set(tokenize(context))
    if not answer_tokens:
        return 1.0
    return len(answer_tokens & context_tokens) / len(answer_tokens)

def mean(values):
    values = list(values)
    return sum(values) / len(values) if values else None
