import type { Integration, IntegrationStatus } from "../integration.types.js";

export function validateIntegration(input: Partial<Integration>): string[] {
    const errors: string[] = [];
    if (!input.id?.trim()) errors.push("Integration id is required");
    if (!input.name?.trim()) errors.push("Integration name is required");
    if (!input.provider?.trim()) errors.push("Integration provider is required");

    if (
        input.status !== undefined &&
        !["active", "inactive", "error"].includes(input.status)
    ) {
        errors.push("Invalid integration status");
    }

    return errors;
}

export function isIntegrationStatus(value: string): value is IntegrationStatus {
    return ["active", "inactive", "error"].includes(value);
}
