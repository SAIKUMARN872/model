from ai.computer_use.constants import ApprovalStatus, ComputerUseStatus
from ai.computer_use.executor import ComputerExecutor
from ai.computer_use.models import ComputerAction
from ai.computer_use.utils import safe_action_parameters


class Context:
    user_id = "test-user"

    def has_permission(self, permission):
        return permission == "computer:execute"

    def has_approval(self, action_id):
        return False


class ApprovalCapture:
    def __init__(self):
        self.payload = None

    def request_approval(self, payload):
        self.payload = payload
        return False


class FakeMouse:
    def __init__(self):
        self.calls = []

    def click(self, x, y):
        self.calls.append((x, y))


def test_sensitive_values_are_redacted_recursively():
    source = {
        "api_key": "secret-value",
        "profile": {
            "access_token": "nested-token",
            "password": "nested-password",
            "display_name": "ModelNow",
        },
        "items": [{"client-secret": "hidden", "value": 3}],
    }
    result = safe_action_parameters(source)

    assert result["api_key"] == "[REDACTED]"
    assert result["profile"]["access_token"] == "[REDACTED]"
    assert result["profile"]["password"] == "[REDACTED]"
    assert result["profile"]["display_name"] == "ModelNow"
    assert result["items"][0]["client-secret"] == "[REDACTED]"
    assert result["items"][0]["value"] == 3
    assert source["api_key"] == "secret-value"


def test_approval_payload_redacts_secrets_without_mutating_action():
    approval = ApprovalCapture()
    action = ComputerAction(
        action_id="sensitive-action",
        action_type="click",
        parameters={
            "x": 4,
            "y": 5,
            "requires_approval": True,
            "api_key": "do-not-disclose",
            "form": {"password": "private"},
        },
    )

    result = ComputerExecutor(approval=approval).execute(action, Context())

    assert result.status == ComputerUseStatus.WAITING_APPROVAL
    assert result.approval_status == ApprovalStatus.PENDING
    assert approval.payload["parameters"]["api_key"] == "[REDACTED]"
    assert approval.payload["parameters"]["form"]["password"] == "[REDACTED]"
    assert action.parameters["api_key"] == "do-not-disclose"


def test_new_mouse_adapter_integrates_with_executor():
    backend = type("Backend", (), {
        "click": lambda self, *args, **kwargs: self.calls.append(
            ("click", args, kwargs)
        )
    })()
    backend.calls = []

    from ai.computer_use.mouse import MouseActions

    action = ComputerAction(
        action_id="safe-click",
        action_type="click",
        parameters={"x": 10, "y": 20},
    )
    result = ComputerExecutor(mouse=MouseActions(backend)).execute(
        action, Context()
    )

    assert result.status == ComputerUseStatus.COMPLETED
    assert backend.calls == [
        ("click", (), {"x": 10, "y": 20, "button": "left"})
    ]
