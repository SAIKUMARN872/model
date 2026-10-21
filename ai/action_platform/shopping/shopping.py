"""High-level shopping workflow coordinator for ModelNow."""

from dataclasses import dataclass
from decimal import Decimal
from typing import Any

from .cart import ShoppingCart, CartSnapshot
from .checkout import Checkout, CheckoutManager
from .product import Product


@dataclass(frozen=True)
class ShoppingTaskResult:
    success: bool
    action: str
    message: str
    cart: dict[str, Any] | None = None
    checkout: dict[str, Any] | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "success": self.success,
            "action": self.action,
            "message": self.message,
            "cart": self.cart,
            "checkout": self.checkout,
        }


class ShoppingManager:
    """Coordinate shopping actions without assuming a retailer integration."""

    def __init__(
        self,
        cart: ShoppingCart,
        checkout_manager: CheckoutManager | None = None,
    ) -> None:
        if not isinstance(cart, ShoppingCart):
            raise TypeError("cart must be a ShoppingCart.")

        self.cart = cart
        self.checkout_manager = checkout_manager or CheckoutManager()

    def add_product(
        self,
        product: Product,
        *,
        quantity: int = 1,
    ) -> ShoppingTaskResult:
        snapshot = self.cart.add(product, quantity)
        return ShoppingTaskResult(
            success=True,
            action="add_product",
            message="Product added to the cart. Inventory and final price must be confirmed by the retailer.",
            cart=snapshot.to_dict(),
        )

    def remove_product(self, product_id: str) -> ShoppingTaskResult:
        removed = self.cart.remove(product_id)
        return ShoppingTaskResult(
            success=removed,
            action="remove_product",
            message=(
                "Product removed from the cart."
                if removed
                else "Product was not found in the cart."
            ),
            cart=self.cart.snapshot().to_dict(),
        )

    def view_cart(self) -> ShoppingTaskResult:
        snapshot = self.cart.snapshot()
        return ShoppingTaskResult(
            success=True,
            action="view_cart",
            message="Current shopping cart.",
            cart=snapshot.to_dict(),
        )

    def prepare_checkout(
        self,
        *,
        shipping_cost: Decimal | str | int = Decimal("0"),
    ) -> ShoppingTaskResult:
        checkout = self.checkout_manager.prepare(
            self.cart,
            shipping_cost=shipping_cost,
        )
        return ShoppingTaskResult(
            success=True,
            action="prepare_checkout",
            message=(
                "Checkout prepared for review. No order has been submitted "
                "and no payment has been made."
            ),
            cart=self.cart.snapshot().to_dict(),
            checkout=checkout.to_dict(),
        )

    def approve_checkout(
        self,
        checkout_id: str,
        *,
        approver_id: str,
    ) -> ShoppingTaskResult:
        checkout = self.checkout_manager.approve(
            checkout_id,
            approver_id=approver_id,
        )
        return ShoppingTaskResult(
            success=True,
            action="approve_checkout",
            message=(
                "Checkout approval recorded. This does not submit the order "
                "or authorize a payment provider."
            ),
            checkout=checkout.to_dict(),
        )

    def submit_checkout(
        self,
        checkout_id: str,
        *,
        retailer: str,
    ) -> ShoppingTaskResult:
        submission = self.checkout_manager.submit(
            checkout_id,
            retailer=retailer,
        )
        return ShoppingTaskResult(
            success=submission.submitted,
            action="submit_checkout",
            message=(
                "Retailer reported that the order was submitted."
                if submission.submitted
                else submission.error or "Order submission was not confirmed."
            ),
            checkout={
                "checkout_id": submission.checkout_id,
                "submitted": submission.submitted,
                "provider_reference": submission.provider_reference,
                "error": submission.error,
            },
        )
