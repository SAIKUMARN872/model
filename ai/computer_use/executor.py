from __future__ import annotations

from typing import Any

from .constants import (
    ApprovalStatus,
    ComputerUseStatus,
    RiskLevel,
    VerificationStatus,
)
from .exceptions import (
    ApprovalRequiredError,
    ComputerActionError,
    SecurityViolationError,
)
from .models import BoundingBox, ComputerAction, ComputerState, Screenshot, ScreenSize, UIElement

from .utils import classify_risk, generate_id, safe_action_parameters
from .ui_detection.elements import normalize_elements


class ComputerExecutor:
    """Validate, authorize, execute, and optionally verify computer actions."""

    def __init__(
        self,
        mouse: Any = None,
        keyboard: Any = None,
        screenshot: Any = None,
        approval: Any = None,
        perception: Any = None,
        verification: Any = None,
    ) -> None:
        self.mouse = mouse
        self.keyboard = keyboard
        self.screenshot = screenshot
        self.approval = approval
        self.perception = perception
        self.verification = verification
        self.last_screenshot_image: Any = None

    def create_action(
        self,
        action_type: str,
        parameters: dict[str, Any] | None = None,
        *,
        action_id: str | None = None,
    ) -> ComputerAction:
        if not isinstance(action_type, str) or not action_type.strip():
            raise ValueError("action_type must be a non-empty string.")
        values = dict(parameters or {})
        return ComputerAction(
            action_id=action_id or generate_id("action"),
            action_type=action_type.strip().lower(),
            parameters=values,
            risk_level=self._risk_level(action_type, values),
        )

    def execute(
        self,
        action: ComputerAction,
        context: Any,
        state: ComputerState | None = None,
    ) -> ComputerAction:
        if not isinstance(action, ComputerAction):
            raise TypeError("action must be a ComputerAction.")

        state = state or ComputerState()
        kind = action.action_type.strip().lower()
        action.action_type = kind

        try:
            self._check_permission(context)
            self._validate_action(action, state)

            if self._needs_approval(action):
                if not self._has_approval(context, action.action_id):
                    if self.approval is None:
                        action.approval_status = ApprovalStatus.PENDING
                        action.status = ComputerUseStatus.WAITING_APPROVAL
                        return action

                    request = {
                        "action_id": action.action_id,
                        "action_type": kind,
                        "risk_level": action.risk_level.value,
                        "parameters": safe_action_parameters(action.parameters),
                    }
                    operation = getattr(self.approval, "request_approval", None)
                    if not callable(operation):
                        raise ComputerActionError(
                            "Approval adapter must implement request_approval(action)."
                        )

                    decision = operation(request)
                    if decision is not True:
                        action.approval_status = ApprovalStatus.PENDING
                        action.status = ComputerUseStatus.WAITING_APPROVAL
                        return action

                action.approval_status = ApprovalStatus.APPROVED

            self._dispatch(action, state)

            if "expected_outcome" in action.parameters:
                self._verify(action)

            action.status = ComputerUseStatus.COMPLETED
            if action.approval_status == ApprovalStatus.PENDING:
                action.approval_status = ApprovalStatus.APPROVED
            elif action.approval_status != ApprovalStatus.APPROVED:
                action.approval_status = ApprovalStatus.NOT_REQUIRED
            return action

        except (ComputerActionError, SecurityViolationError, ApprovalRequiredError):
            action.status = ComputerUseStatus.FAILED
            raise
        except Exception as exc:
            action.status = ComputerUseStatus.FAILED
            raise ComputerActionError(
                f"Computer action '{kind}' failed: {exc}"
            ) from exc

    @staticmethod
    def _check_permission(context: Any) -> None:
        if context is None:
            raise SecurityViolationError(
                "A trusted context with computer:execute permission is required."
            )

        checker = getattr(context, "has_permission", None)
        if callable(checker):
            allowed = checker("computer:execute")
        else:
            permissions = getattr(context, "permissions", ())
            allowed = "computer:execute" in permissions

        if not allowed:
            raise SecurityViolationError(
                "Missing required permission: computer:execute."
            )

    @staticmethod
    def _has_approval(context: Any, action_id: str) -> bool:
        checker = getattr(context, "has_approval", None)
        if callable(checker):
            return checker(action_id) is True
        return action_id in getattr(context, "approved_actions", ())

    @staticmethod
    def _risk_level(
        action_type: str, parameters: dict[str, Any]
    ) -> RiskLevel:
        risk = classify_risk(action_type, parameters)
        intent = parameters.get("intent")
        if isinstance(intent, str):
            intent_risk = classify_risk(intent, parameters)
            if intent_risk in {RiskLevel.HIGH, RiskLevel.CRITICAL}:
                return intent_risk
        return risk

    def _needs_approval(self, action: ComputerAction) -> bool:
        if action.parameters.get("requires_approval") is True:
            return True
        if action.risk_level in {RiskLevel.HIGH, RiskLevel.CRITICAL}:
            return True

        intent = action.parameters.get("intent")
        if isinstance(intent, str):
            return classify_risk(intent, action.parameters) in {
                RiskLevel.HIGH,
                RiskLevel.CRITICAL,
            }
        return False

    def _validate_action(
        self, action: ComputerAction, state: ComputerState
    ) -> None:
        parameters = action.parameters
        kind = action.action_type

        supported = {
            "move", "click", "double_click", "right_click",
            "drag", "scroll", "type", "press", "hotkey", "screenshot",
        }
        if kind not in supported:
            raise ComputerActionError(f"Unsupported computer action: {kind}")

        if not isinstance(parameters, dict):
            raise ComputerActionError("Action parameters must be a dictionary.")

        if "target_element_id" in parameters:
            target_id = parameters["target_element_id"]
            if kind not in {"click", "double_click", "right_click"}:
                raise ComputerActionError(
                    "target_element_id is supported only for click actions."
                )
            if not isinstance(target_id, str) or not target_id.strip():
                raise ComputerActionError(
                    "target_element_id must be a non-empty string."
                )

        if kind in {"move", "click", "double_click", "right_click"}:
            self._validate_point(parameters, "x", "y", state)

        elif kind == "drag":
            self._validate_point(parameters, "start_x", "start_y", state)
            self._validate_point(parameters, "end_x", "end_y", state)

        elif kind == "scroll":
            amount = parameters.get("amount")
            if isinstance(amount, bool) or not isinstance(amount, int):
                raise ComputerActionError("Scroll amount must be an integer.")
            if state.screen_size is not None and (
                "x" in parameters or "y" in parameters
            ):
                self._validate_point(parameters, "x", "y", state)

        elif kind == "type":
            if not isinstance(parameters.get("text"), str):
                raise ComputerActionError("Type action requires a text string.")

        elif kind == "press":
            if not isinstance(parameters.get("key"), str) or not parameters["key"].strip():
                raise ComputerActionError("Press action requires a non-empty key.")

        elif kind == "hotkey":
            keys = parameters.get("keys")
            if (
                not isinstance(keys, (list, tuple))
                or not keys
                or any(not isinstance(key, str) or not key.strip() for key in keys)
            ):
                raise ComputerActionError(
                    "Hotkey action requires a non-empty list of key names."
                )

    @staticmethod
    def _validate_point(
        parameters: dict[str, Any],
        x_key: str,
        y_key: str,
        state: ComputerState,
    ) -> None:
        x, y = parameters.get(x_key), parameters.get(y_key)
        if (
            isinstance(x, bool) or not isinstance(x, int)
            or isinstance(y, bool) or not isinstance(y, int)
        ):
            raise ComputerActionError(
                f"Coordinates '{x_key}' and '{y_key}' must be integers."
            )
        if x < 0 or y < 0:
            raise ComputerActionError("Coordinates cannot be negative.")

        size = state.screen_size
        if size is not None and (x >= size.width or y >= size.height):
            raise ComputerActionError("Coordinates are outside the screen bounds.")

    def _validate_grounded_target(self, action: ComputerAction) -> None:
        target_id = action.parameters.get("target_element_id")

        if self.screenshot is None or self.perception is None:
            raise ComputerActionError(
                "Grounded clicks require screenshot and perception adapters."
            )

        observation_action = self.create_action("screenshot")
        self._capture_and_perceive(observation_action)
        observation = observation_action.parameters.get("perception_result")

        if not isinstance(observation, dict):
            raise ComputerActionError("Fresh perception results are unavailable.")
        if observation.get("detection_available") is not True:
            raise ComputerActionError("Fresh UI element detections are unavailable.")

        elements = observation.get("elements")
        if not isinstance(elements, list):
            raise ComputerActionError("Fresh UI element detections are invalid.")

        matches = [
            element for element in elements
            if isinstance(element, UIElement) and element.element_id == target_id
        ]
        if len(matches) != 1:
            raise ComputerActionError(
                "Grounded click requires exactly one matching UI element."
            )

        element = matches[0]
        trusted_types = {
            "button", "link", "checkbox", "radio", "input", "textbox",
            "text_field", "select", "menuitem", "menu_item", "tab",
            "clickable", "combobox", "option",
        }

        if element.metadata.get("source") == "tesseract_ocr":
            raise ComputerActionError("OCR text cannot authorize a grounded click.")
        if not element.interactable:
            raise ComputerActionError("Target UI element is not interactable.")
        if element.element_type.strip().lower() not in trusted_types:
            raise ComputerActionError("Target is not a supported interactive control.")
        if element.bounds is None:
            raise ComputerActionError("Target UI element has no bounding box.")
        if element.confidence < 0.5:
            raise ComputerActionError("Target UI element confidence is too low.")

        bounds = element.bounds
        if (
            bounds.width <= 0 or bounds.height <= 0
            or bounds.x < 0 or bounds.y < 0
        ):
            raise ComputerActionError("Target UI element bounds are invalid.")

        x = action.parameters["x"]
        y = action.parameters["y"]
        if not (
            bounds.x <= x < bounds.x + bounds.width
            and bounds.y <= y < bounds.y + bounds.height
        ):
            raise ComputerActionError(
                "Click coordinates are outside the target UI element."
            )
    def _dispatch(self, action: ComputerAction, state: ComputerState) -> None:
        kind = action.action_type
        p = action.parameters

        if kind == "screenshot":
            self._capture_and_perceive(action)
            return

        if "target_element_id" in p:
            self._validate_grounded_target(action)

        if kind in {"move", "click", "double_click", "right_click", "drag", "scroll"}:
            if self.mouse is None:
                raise ComputerActionError("No mouse adapter is configured.")

            if kind == "move":
                self._call_adapter(self.mouse, ("move", "move_to"), p["x"], p["y"])
            elif kind == "click":
                button = p.get("button", "left")
                if button not in {"left", "right", "middle"}:
                    raise ComputerActionError("Unsupported mouse button.")
                if button == "right":
                    self._call_adapter(self.mouse, ("right_click",), p["x"], p["y"])
                else:
                    operation = getattr(self.mouse, "click", None)
                    if not callable(operation):
                        raise ComputerActionError("Mouse adapter lacks click().")
                    if button == "middle":
                        operation(p["x"], p["y"], button="middle")
                    else:
                        operation(p["x"], p["y"])
            elif kind == "double_click":
                self._call_adapter(
                    self.mouse, ("double_click", "doubleClick"), p["x"], p["y"]
                )
            elif kind == "right_click":
                self._call_adapter(
                    self.mouse, ("right_click", "rightClick"), p["x"], p["y"]
                )
            elif kind == "drag":
                self._call_adapter(
                    self.mouse,
                    ("drag",),
                    p["start_x"], p["start_y"], p["end_x"], p["end_y"],
                )
            else:
                operation = getattr(self.mouse, "scroll", None)
                if not callable(operation):
                    raise ComputerActionError("Mouse adapter lacks scroll().")
                if "x" in p or "y" in p:
                    operation(p["amount"], x=p.get("x"), y=p.get("y"))
                else:
                    operation(p["amount"])
            return

        if kind in {"type", "press", "hotkey"}:
            if self.keyboard is None:
                raise ComputerActionError("No keyboard adapter is configured.")
            if kind == "type":
                self._call_adapter(
                    self.keyboard, ("type_text", "write"), p["text"]
                )
            elif kind == "press":
                self._call_adapter(self.keyboard, ("press",), p["key"])
            else:
                self._call_adapter(
                    self.keyboard, ("hotkey",), *tuple(p["keys"])
                )

    @staticmethod
    def _call_adapter(
        adapter: Any, method_names: tuple[str, ...], *args: Any
    ) -> Any:
        for name in method_names:
            operation = getattr(adapter, name, None)
            if callable(operation):
                return operation(*args)
        raise ComputerActionError(
            f"Adapter does not implement any of: {', '.join(method_names)}."
        )

    def _capture_and_perceive(self, action: ComputerAction) -> Any:
        if self.screenshot is None:
            raise ComputerActionError("No screenshot adapter is configured.")

        capture = getattr(self.screenshot, "capture", None)
        if not callable(capture):
            raise ComputerActionError("Screenshot adapter lacks capture().")

        image = capture()
        if image is None:
            raise ComputerActionError("Screenshot adapter returned no image.")

        self.last_screenshot_image = image
        size = getattr(image, "size", None)
        if (
            isinstance(size, (tuple, list))
            and len(size) == 2
            and all(isinstance(value, int) and not isinstance(value, bool) and value > 0
                    for value in size)
        ):
            width, height = size
            record = Screenshot(
                screenshot_id=generate_id("screenshot"),
                width=width,
                height=height,
            )
            action.parameters["capture_result"] = record
        else:
            action.parameters["capture_result"] = image

        if self.perception is not None:
            perceive = getattr(self.perception, "perceive", None)
            if not callable(perceive):
                raise ComputerActionError(
                    "Perception adapter must implement perceive(screenshot)."
                )
            observed = perceive(image)
            if not isinstance(observed, dict):
                raise ComputerActionError("Perception must return a dictionary.")

            size = getattr(image, "size", None)
            width = size[0] if isinstance(size, (tuple, list)) and len(size) == 2 else None
            height = size[1] if isinstance(size, (tuple, list)) and len(size) == 2 else None
            try:
                detected = normalize_elements(
                    observed.get("elements", []),
                    screen_width=width,
                    screen_height=height,
                )
            except (TypeError, ValueError) as exc:
                raise ComputerActionError(
                    "Perception returned invalid UI elements."
                ) from exc

            action.parameters["perception_result"] = {
                "analysis": observed.get("analysis"),
                "elements": detected,
                "analysis_available": bool(observed.get("analysis_available")),
                "detection_available": bool(observed.get("detection_available")),
            }
        return image

    def _verification_evidence(self, action: ComputerAction) -> Any:
        if action.action_type == "screenshot":
            return action.parameters.get("perception_result")

        if self.screenshot is None or self.perception is None:
            return None

        temporary_action = ComputerAction(
            action_id=generate_id("verification"),
            action_type="screenshot",
        )
        try:
            self._capture_and_perceive(temporary_action)
        except Exception:
            return None

        return temporary_action.parameters.get("perception_result")

    def _verify(self, action: ComputerAction) -> None:
        expected = action.parameters.get("expected_outcome")
        actual = self._verification_evidence(action)

        def fail(message: str, evidence: dict[str, Any] | None = None) -> None:
            action.parameters["verification_result"] = {
                "status": VerificationStatus.FAILED.value,
                "success": False,
                "message": message,
                "evidence": evidence or {},
            }
            raise ComputerActionError(message)

        if expected is None:
            fail("Action verification failed: expected_outcome is missing.")

        if self.verification is None:
            fail("Action verification failed: no verifier is configured.")

        if not isinstance(actual, dict):
            fail(
                "Action verification failed: fresh visual evidence is unavailable."
            )

        operation = getattr(self.verification, "verify", None)
        if not callable(operation):
            fail(
                "Action verification failed: verifier must implement "
                "verify(expected, actual).",
                {"actual": actual},
            )

        try:
            verified = operation(expected, actual)
            if type(verified) is not bool:
                raise TypeError("Verifier must return a boolean.")
        except Exception as exc:
            fail(
                f"Action verification failed: verifier raised an error: {exc}",
                {"actual": actual},
            )

        status = VerificationStatus.PASSED if verified else VerificationStatus.FAILED
        action.parameters["verification_result"] = {
            "status": status.value,
            "success": verified,
            "message": (
                "Expected outcome verified."
                if verified
                else "Expected outcome was not verified."
            ),
            "evidence": {"actual": actual},
        }
        if not verified:
            raise ComputerActionError("Action verification failed.")
