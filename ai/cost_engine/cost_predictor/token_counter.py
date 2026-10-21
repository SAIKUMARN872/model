def estimate_tokens(text: str) -> int:
    """Conservative lightweight token estimate without a tokenizer dependency."""
    if not text:
        return 0
    return max(1, round(len(text.split()) * 1.3))


def estimate_total_tokens(input_text: str, output_text: str = "") -> int:
    return estimate_tokens(input_text) + estimate_tokens(output_text)
