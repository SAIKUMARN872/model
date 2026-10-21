"""Shopping domain handler for the ModelNow action router."""

from __future__ import annotations

import inspect
from typing import Any, Mapping

from ai.action_platform.core.action import ActionDomain, ActionStatus
from ai.action_platform.core.models import ActionRequest, ActionResult
from ai.action_platform.exceptions import ActionExecutionError
from ai.action_platform.shopping.product import Product
from ai.action_platform.shopping.shopping import ShoppingManager


class ShoppingActionHandler:
    """Adapt trusted shopping services to the shared action contract."""

    def __init__(
        self,
        manager: ShoppingManager,
        catalog: Mapping[str, Product] | None = None,
    ) -> None:
        if not isinstance(manager, ShoppingManager):
            raise TypeError("manager must be a ShoppingManager.")

        self.manager = manager
        self.catalog = dict(catalog or {})

        for product_id, product in self.catalog.items():
            if not isinstance(product_id, str) or not isinstance(product, Product):
                raise TypeError("Catalog entries must map product IDs to Product objects.")
            if product_id != product.product_id:
                raise ValueError("Catalog keys must match Product.product_id.")

    async def execute(
        self,
        request: ActionRequest,
        context: Any = None,
    ) -> ActionResult:
        if not isinstance(request, ActionRequest):
            raise TypeError("request must be an ActionRequest.")

        if request.domain != ActionDomain.SHOPPING:
            raise ValueError("ShoppingActionHandler only accepts shopping actions.")

        if context is None or not getattr(context, "user_id", None):
            raise PermissionError("A trusted user context is required.")

        payload = request.payload
        operation = payload.get("operation")

        try:
            if operation == "add_product":
                product_id = payload.get("product_id")
                product = self.catalog.get(product_id) if isinstance(product_id, str) else None
                if product is None:
                    return self._result(
                        request,
                        ActionStatus.FAILED,
                        message="Product is not present in the configured trusted catalog.",
                    )

                quantity = payload.get("quantity", 1)
                outcome = self.manager.add_product(product, quantity=quantity)
                return self._from_manager_result(request, outcome)

            if operation == "remove_product":
                product_id = payload.get("product_id")
                if not isinstance(product_id, str) or not product_id.strip():
                    raise ValueError("product_id is required.")

                outcome = self.manager.remove_product(product_id)
                return self._from_manager_result(request, outcome)

            if operation == "view_cart":
                return self._from_manager_result(
                    request,
                    self.manager.view_cart(),
                )

            if operation == "prepare_checkout":
                shipping_cost = payload.get("shipping_cost", "0")
                outcome = self.manager.prepare_checkout(
                    shipping_cost=shipping_cost,
                )
                return self._from_manager_result(
                    request,
                    outcome,
                    status_override=ActionStatus.AWAITING_APPROVAL,
                )

            if operation == "approve_checkout":
                checkout_id = payload.get("checkout_id")
                if not isinstance(checkout_id, str) or not checkout_id.strip():
                    raise ValueError("checkout_id is required.")

                outcome = self.manager.approve_checkout(
                    checkout_id,
                    approver_id=context.user_id,
                )
                return self._from_manager_result(request, outcome)

            if operation == "submit_checkout":
                checkout_id = payload.get("checkout_id")
                retailer = payload.get("retailer")

                if not isinstance(checkout_id, str) or not checkout_id.strip():
                    raise ValueError("checkout_id is required.")
                if not isinstance(retailer, str) or not retailer.strip():
                    raise ValueError("retailer is required.")

                # The router must have approved this exact action task.
                if not context.has_approval(request.task_id):
                    return self._result(
                        request,
                        ActionStatus.AWAITING_APPROVAL,
                        message="Approval for this action task is required.",
                        data={"approval_required": True},
                    )

                outcome = self.manager.submit_checkout(
                    checkout_id,
                    retailer=retailer,
                )
                return self._from_manager_result(request, outcome)

            return self._result(
                request,
                ActionStatus.FAILED,
                message=f"Unsupported shopping operation: {operation!r}.",
            )

        except (ValueError, TypeError, KeyError, PermissionError) as exc:
            return self._result(
                request,
                ActionStatus.FAILED,
                message=str(exc),
            )
        except Exception as exc:
            # Do not retry a potentially consequential provider operation here.
            raise ActionExecutionError(
                f"Shopping operation failed ({type(exc).__name__}). "
                "Check the checkout/provider state before retrying."
            ) from exc

    @staticmethod
    def _from_manager_result(
        request: ActionRequest,
        outcome: Any,
        *,
        status_override: ActionStatus | None = None,
    ) -> ActionResult:
        if not callable(getattr(outcome, "to_dict", None)):
            raise TypeError("Shopping manager returned an invalid result.")

        data = outcome.to_dict()
        success = getattr(outcome, "success", False)

        if status_override is not None:
            status = status_override
        elif success:
            status = ActionStatus.COMPLETED
        else:
            status = ActionStatus.FAILED

        return ActionResult(
            task_id=request.task_id,
            domain=ActionDomain.SHOPPING,
            status=status,
            goal=request.goal,
            data=data,
            error=None if success or status_override else getattr(outcome, "message", "Operation failed."),
        )

    @staticmethod
    def _result(
        request: ActionRequest,
        status: ActionStatus,
        *,
        message: str,
        data: dict[str, Any] | None = None,
    ) -> ActionResult:
        return ActionResult(
            task_id=request.task_id,
            domain=ActionDomain.SHOPPING,
            status=status,
            goal=request.goal,
            data={"message": message, **(data or {})},
            error=message if status == ActionStatus.FAILED else None,
        )
