import type {
    CreditBalance
} from "../models.js";

export function isCreditBalance(
    value: unknown
): value is CreditBalance {
    if (
        !value ||
        typeof value !== "object"
    ) {
        return false;
    }

    const item =
        value as Partial<CreditBalance>;

    return (
        typeof item.customerId === "string" &&
        typeof item.balance === "number" &&
        typeof item.currency === "string"
    );
}
