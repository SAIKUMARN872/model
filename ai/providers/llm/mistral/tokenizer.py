@'
class MistralTokenizer:
    """
    Lightweight tokenizer approximation.

    Production token accounting should prefer provider-reported
    usage and a dedicated tokenizer implementation where available.
    """

    @staticmethod
    def count_tokens(text: str) -> int:
        if not text:
            return 0

        return max(1, len(text) // 4)

    @staticmethod
    def count_messages(messages) -> int:
        total = 0

        for message in messages:
            content = (
                message.content
                if hasattr(message, "content")
                else message.get("content", "")
            )

            if isinstance(content, str):
                total += MistralTokenizer.count_tokens(content)

        return total
'@ | Set-Content .\ai\providers\llm\mistral\tokenizer.py