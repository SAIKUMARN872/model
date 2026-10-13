import type { Invoice } from "../models.js";

export function isInvoice(
    value: unknown
): value is Invoice {
    if (
        !value ||
        typeof value !== "object"
    ) {
        return false;
    }

    const item =
        value as Partial<Invoice>;

    return (
        typeof item.id === "string" &&
        typeof item.customerId === "string" &&
        typeof item.total === "number" &&
        Array.isArray(item.lines)
    );
}
