import type { ConnectionStatus } from "../integration.types.js";

export function isConnectionHealthy(status: ConnectionStatus): boolean {
    return status === "connected";
}

export function assertConnectionTransition(
    current: ConnectionStatus,
    next: ConnectionStatus
): void {
    const allowed: Record<ConnectionStatus, ConnectionStatus[]> = {
        disconnected: ["connecting", "error"],
        connecting: ["connected", "disconnected", "error"],
        connected: ["disconnected", "connecting", "error"],
        error: ["disconnected", "connecting"]
    };

    if (!allowed[current].includes(next)) {
        throw new Error(`Invalid connection status transition: ${current} -> ${next}`);
    }
}
