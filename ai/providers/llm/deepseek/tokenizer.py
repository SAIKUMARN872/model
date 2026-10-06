@'
from __future__ import annotations

from typing import Any, Iterable


class DeepSeekTokenizer:
    """
    Lightweight pre-request token estimator.

    Exact token counts come from DeepSeek usage data.
    """

    def estimate_text(
        self,
        text: str,
    ) -> int:
        if not text:
            return 0

        return max(
            1,
            len(text) // 4,
        )

    def estimate_content(
        self,
        content: Any,
    ) -> int:
        if content is None:
            return 0

        if isinstance(
            content,
            str,
        ):
            return self.estimate_text(
                content
            )

        if isinstance(
            content,
            list,
        ):
            total = 0

            for item in content:
                if isinstance(
                    item,
                    str,
                ):
                    total += (
                        self.estimate_text(
                            item
                        )
                    )

                elif isinstance(
                    item,
                    dict,
                ):
                    text = item.get(
                        "text"
                    )

                    if isinstance(
                        text,
                        str,
                    ):
                        total += (
                            self.estimate_text(
                                text
                            )
                        )

            return total

        return self.estimate_text(
            str(content)
        )

    def estimate_messages(
        self,
        messages: Iterable[Any],
    ) -> int:
        total = 0

        for message in messages:
            if hasattr(
                message,
                "content",
            ):
                content = (
                    message.content
                )

            elif isinstance(
                message,
                dict,
            ):
                content = message.get(
                    "content"
                )

            else:
                content = str(message)

            total += (
                self.estimate_content(
                    content
                )
            )

        return total
'@ | Set-Content ".\ai\providers\llm\deepseek\tokenizer.py" -Encoding UTF8