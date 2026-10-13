import type { Plan } from "../models.js";

export function isPlan(
    value: unknown
): value is Plan {
    if (
        !value ||
        typeof value !== "object"
    ) {
        return false;
    }

    const item =
        value as Partial<Plan>;

    return (
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        typeof item.currency === "string"
    );
}
