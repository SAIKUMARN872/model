export function clone<T>(value: T): T {
    if (value instanceof Date) {
        return new Date(value.getTime()) as T;
    }

    if (Array.isArray(value)) {
        return value.map((item) => clone(item)) as T;
    }

    if (value && typeof value === "object") {
        const output: Record<string, unknown> = {};

        for (const [key, item] of Object.entries(value)) {
            output[key] = clone(item);
        }

        return output as T;
    }

    return value;
}

export function money(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function assertPositive(
    value: number,
    field: string
): void {
    if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`${field} must be greater than zero`);
    }
}

export function assertNonNegative(
    value: number,
    field: string
): void {
    if (!Number.isFinite(value) || value < 0) {
        throw new Error(`${field} cannot be negative`);
    }
}

export function addMonths(
    date: Date,
    months: number
): Date {
    const result = new Date(date);
    result.setUTCMonth(result.getUTCMonth() + months);
    return result;
}

export function addYears(
    date: Date,
    years: number
): Date {
    const result = new Date(date);
    result.setUTCFullYear(result.getUTCFullYear() + years);
    return result;
}

export function addBillingInterval(
    date: Date,
    interval: "month" | "year"
): Date {
    return interval === "year"
        ? addYears(date, 1)
        : addMonths(date, 1);
}
