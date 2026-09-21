cd "C:\Users\pamar\Downloads\model-main\model-main"

@'
import re
from typing import Any, Mapping, Sequence


class DeepSeekTokenizer:
    """
    Lightweight tokenizer approximation used by ModelNow for
    cost estimation and routing when the provider tokenizer is
    not directly available.
    """

    _pattern = re.compile(r"\w+|[^\w\s]", re.UNICODE)

    def count(self, text: str) -> int:
        if not text:
            return 0

        return max(1, len(self._pattern.findall(text)))

    def count_messages(
        self,
        messages: Sequence[Mapping[str, Any]],
    ) -> int:
        total = 0

        for message in messages:
            content = message.get("content", "")

            if isinstance(content, str):
                total += self.count(content)
            else:
                total += self.count(str(content))

        return total


__all__ = ["DeepSeekTokenizer"]
'@ | Set-Content ".\ai\providers\llm\deepseek\tokenizer.py" -Encoding UTF8