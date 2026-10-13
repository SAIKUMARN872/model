import type {
    Subscription
} from "../models.js";

export function isSubscription(
    value: unknown
): value is Subscription {
    if (
        !value ||
        typeof value !== "object"
    ) {
        return false;
    }

    const item =
        value as Partial<Subscription>;

    return (
        typeof item.id === "string" &&
        typeof item.customerId === "string" &&
        typeof item.planId === "string" &&
        typeof item.quantity === "number"
    );
}
