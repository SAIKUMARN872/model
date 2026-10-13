import type { IntegrationConnection, ConnectionStatus } from "../integration.types.js";

export function validateConnection(input: Partial<IntegrationConnection>): string[] {
    const errors: string[] = [];
    if (!input.id?.trim()) errors.push("Connection id is required");
    if (!input.integrationId?.trim()) errors.push("integrationId is required");
    if (!input.name?.trim()) errors.push("Connection name is required");

    if (
        input.status !== undefined &&
        !["connected", "disconnected", "connecting", "error"].includes(input.status)
    ) {
        errors.push("Invalid connection status");
    }

    return errors;
}

export function isConnectionStatus(value: string): value is ConnectionStatus {
    return ["connected", "disconnected", "connecting", "error"].includes(value);
}
