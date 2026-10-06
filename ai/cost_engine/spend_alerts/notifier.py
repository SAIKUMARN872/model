from typing import Callable

class SpendAlertNotifier:
    def __init__(self, callback: Callable[[dict], None] | None = None):
        self.callback = callback

    def notify(self, alert: dict) -> None:
        if self.callback is not None:
            self.callback(alert)
