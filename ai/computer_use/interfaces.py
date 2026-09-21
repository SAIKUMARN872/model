from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Protocol


class ComputerInterface(ABC):

    @abstractmethod
    def initialize(self) -> None:
        pass

    @abstractmethod
    def shutdown(self) -> None:
        pass

    @abstractmethod
    def get_state(self) -> dict[str, Any]:
        pass


class MouseInterface(Protocol):

    def move(self, x: int, y: int) -> None:
        ...

    def click(self, x: int, y: int) -> None:
        ...

    def double_click(self, x: int, y: int) -> None:
        ...

    def right_click(self, x: int, y: int) -> None:
        ...

    def drag(self, start_x: int, start_y: int, end_x: int, end_y: int) -> None:
        ...

    def scroll(self, amount: int) -> None:
        ...


class KeyboardInterface(Protocol):

    def type_text(self, text: str) -> None:
        ...

    def press(self, key: str) -> None:
        ...

    def hotkey(self, *keys: str) -> None:
        ...


class ScreenshotInterface(Protocol):

    def capture(self) -> Any:
        ...


class ScreenUnderstandingInterface(Protocol):

    def analyze(self, screenshot: Any) -> dict[str, Any]:
        ...


class UIElementDetectorInterface(Protocol):

    def detect(self, screenshot: Any) -> list[dict[str, Any]]:
        ...


class ApplicationInterface(Protocol):

    def launch(self, application: str) -> Any:
        ...

    def close(self, application: str) -> None:
        ...


class WindowInterface(Protocol):

    def find(self, title: str) -> Any:
        ...

    def focus(self, window: Any) -> None:
        ...


class ApprovalInterface(Protocol):

    def requires_approval(self, action: dict[str, Any]) -> bool:
        ...

    def request_approval(self, action: dict[str, Any]) -> Any:
        ...


class VerificationInterface(Protocol):

    def verify(self, expected: Any, actual: Any) -> bool:
        ...
