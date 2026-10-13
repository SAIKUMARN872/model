"""Controlled payment processing for ModelNow."""

from threading import RLock
from typing import Any, Callable

from .authorization import PaymentAuthorizationManager
from .payment import PaymentRequest, PaymentResult, PaymentStatus


PaymentHandler = Callable[[PaymentRequest], dict[str, Any]]


class PaymentProcessor:
    """Dispatch approved payment requests to explicitly registered providers.

    Provider handlers must be implemented using a trusted payment gateway.
    This class does not itself move money or verify provider webhooks.
    """

    def __init__(
        self,
        authorization_manager: PaymentAuthorizationManager,
    ) -> None:
        if not isinstance(authorization_manager, PaymentAuthorizationManager):
            raise TypeError(
                "authorization_manager must be a PaymentAuthorizationManager."
            )

        self._authorization_manager = authorization_manager
        self._handlers: dict[str, PaymentHandler] = {}
        self._results: dict[str, PaymentResult] = {}
        self._processing: set[str] = set()
        self._lock = RLock()

    def register_provider(
        self,
        provider: str,
        handler: PaymentHandler,
    ) -> None:
        if not isinstance(provider, str) or not provider.strip():
            raise ValueError("provider must not be empty.")
        if len(provider) > 100:
            raise ValueError("provider must be at most 100 characters.")
        if not callable(handler):
            raise TypeError("handler must be callable.")

        key = provider.strip().lower()
        with self._lock:
            if key in self._handlers:
                raise ValueError(f"Provider already registered: {key}")
            self._handlers[key] = handler

    def process(self, request: PaymentRequest) -> PaymentResult:
        if not isinstance(request, PaymentRequest):
            raise TypeError("request must be a PaymentRequest.")

        payment_id = request.payment_id.strip()
        if not payment_id:
            return self._result(
                request,
                PaymentStatus.FAILED,
                error="A payment_id is required.",
            )

        if request.requires_approval and not self._authorization_manager.is_authorized(
            request
        ):
            return self._result(
                request,
                PaymentStatus.AWAITING_APPROVAL,
                error="Valid explicit approval is required before processing.",
            )

        provider_key = request.provider.strip().lower()
        with self._lock:
            existing = self._results.get(payment_id)
            if existing is not None:
                return existing

            if payment_id in self._processing:
                return self._result(
                    request,
                    PaymentStatus.PROCESSING,
                    error="This payment is already being processed.",
                )

            handler = self._handlers.get(provider_key)
            if handler is None:
                return self._result(
                    request,
                    PaymentStatus.FAILED,
                    error="No registered handler for the requested provider.",
                )

            self._processing.add(payment_id)

        try:
            provider_result = handler(request)
            result = self._normalize_provider_result(request, provider_result)
        except Exception:
            result = self._result(
                request,
                PaymentStatus.UNKNOWN,
                error="Provider processing outcome is unknown; reconcile with the provider.",
            )
        finally:
            with self._lock:
                self._processing.discard(payment_id)

        with self._lock:
            # Keep terminal or uncertain outcomes to avoid silently retrying a
            # payment that may already have been accepted by the provider.
            self._results.setdefault(payment_id, result)
            return self._results[payment_id]

    def get_result(self, payment_id: str) -> PaymentResult | None:
        with self._lock:
            return self._results.get(payment_id)

    @staticmethod
    def _normalize_provider_result(
        request: PaymentRequest,
        provider_result: dict[str, Any],
    ) -> PaymentResult:
        if not isinstance(provider_result, dict):
            return PaymentResult(
                payment_id=request.payment_id,
                order_id=request.order_id,
                status=PaymentStatus.UNKNOWN,
                amount=request.amount,
                currency=request.currency.upper(),
                error="Provider returned an invalid response; reconcile before retrying.",
            )

        raw_status = provider_result.get("status")
        try:
            status = PaymentStatus(raw_status)
        except (ValueError, TypeError):
            status = PaymentStatus.UNKNOWN

        reference = provider_result.get("provider_reference")
        if reference is not None and (
            not isinstance(reference, str) or len(reference) > 300
        ):
            reference = None
            status = PaymentStatus.UNKNOWN

        error = provider_result.get("error")
        if error is not None and not isinstance(error, str):
            error = "Provider returned an invalid error field."

        # A success status without a provider reference is not trusted.
        if status == PaymentStatus.SUCCEEDED and not reference:
            status = PaymentStatus.UNKNOWN
            error = "Provider success response lacked a reference; reconcile before retrying."

        return PaymentResult(
            payment_id=request.payment_id,
            order_id=request.order_id,
            status=status,
            amount=request.amount,
            currency=request.currency.upper(),
            provider_reference=reference,
            error=error,
        )

    @staticmethod
    def _result(
        request: PaymentRequest,
        status: PaymentStatus,
        *,
        error: str | None = None,
    ) -> PaymentResult:
        return PaymentResult(
            payment_id=request.payment_id,
            order_id=request.order_id,
            status=status,
            amount=request.amount,
            currency=request.currency.upper(),
            error=error,
        )
