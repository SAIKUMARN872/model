import type { IntegrationCredential } from "../integration.types.js";

export function validateCredential(input: Partial<IntegrationCredential>): string[] {
    const errors: string[] = [];
    if (!input.id?.trim()) errors.push("Credential id is required");
    if (!input.integrationId?.trim()) errors.push("integrationId is required");
    if (!input.secret?.trim()) errors.push("Credential secret is required");

    if (
        input.kind !== undefined &&
        !["api_key", "oauth", "basic", "custom"].includes(input.kind)
    ) {
        errors.push("Invalid credential kind");
    }

    return errors;
}
