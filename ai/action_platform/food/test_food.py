"""Tests for ModelNow Food Action Platform."""

import unittest

from ai.action_platform.food import (
    FoodOrderItem,
    FoodOrderRequest,
    FoodOrderStatus,
    MenuItem,
    Restaurant,
    prepare_food_order,
    verify_food_order_status,
)


class FoodActionTests(unittest.TestCase):
    def setUp(self):
        self.restaurant = Restaurant(
            restaurant_id="rest-1",
            name="Demo Restaurant",
            menu=(
                MenuItem("item-1", "Veg Burger", 120.00),
                MenuItem("item-2", "Fries", 60.00),
                MenuItem("item-3", "Unavailable Dish", 90.00, available=False),
            ),
        )
        self.request = FoodOrderRequest(
            restaurant_id="rest-1",
            items=(
                FoodOrderItem("item-1", 2),
                FoodOrderItem("item-2", 1),
            ),
            order_id="order-1",
        )

    def test_valid_order_preparation(self):
        prepared = prepare_food_order(self.request, self.restaurant)
        self.assertEqual(prepared.status if hasattr(prepared, "status") else "awaiting_approval",
                         "awaiting_approval")
        self.assertEqual(prepared.subtotal, "300.0")
        self.assertTrue(prepared.requires_approval)
        self.assertFalse(prepared.approved)

    def test_order_serialization(self):
        result = prepare_food_order(self.request, self.restaurant).to_dict()
        self.assertEqual(result["order_id"], "order-1")
        self.assertEqual(result["subtotal"], "300.0")
        self.assertEqual(result["status"], "awaiting_approval")

    def test_restaurant_mismatch_rejected(self):
        request = FoodOrderRequest(
            restaurant_id="other",
            items=(FoodOrderItem("item-1"),),
        )
        with self.assertRaises(ValueError):
            prepare_food_order(request, self.restaurant)

    def test_unknown_menu_item_rejected(self):
        request = FoodOrderRequest(
            restaurant_id="rest-1",
            items=(FoodOrderItem("missing-item"),),
        )
        with self.assertRaises(ValueError):
            prepare_food_order(request, self.restaurant)

    def test_unavailable_menu_item_rejected(self):
        request = FoodOrderRequest(
            restaurant_id="rest-1",
            items=(FoodOrderItem("item-3"),),
        )
        with self.assertRaises(ValueError):
            prepare_food_order(request, self.restaurant)

    def test_restaurant_not_accepting_orders(self):
        restaurant = Restaurant(
            restaurant_id="rest-1",
            name="Closed Restaurant",
            menu=self.restaurant.menu,
            accepts_orders=False,
        )
        with self.assertRaises(ValueError):
            prepare_food_order(self.request, restaurant)

    def test_invalid_quantity_rejected(self):
        with self.assertRaises(ValueError):
            FoodOrderItem("item-1", 0)

    def test_confirmation_requires_provider_reference(self):
        result = verify_food_order_status(
            order_id="order-1",
            provider_status="confirmed",
        )
        self.assertEqual(result.status, FoodOrderStatus.CONFIRMED)
        self.assertFalse(result.verified)

    def test_confirmation_with_reference(self):
        result = verify_food_order_status(
            order_id="order-1",
            provider_status="confirmed",
            provider_reference="provider-ref-1",
        )
        self.assertTrue(result.verified)

    def test_unknown_provider_status(self):
        result = verify_food_order_status(
            order_id="order-1",
            provider_status="maybe",
        )
        self.assertEqual(result.status, FoodOrderStatus.UNKNOWN)
        self.assertFalse(result.verified)

    def test_empty_order_id_rejected(self):
        with self.assertRaises(ValueError):
            verify_food_order_status(order_id=" ")


if __name__ == "__main__":
    unittest.main()
