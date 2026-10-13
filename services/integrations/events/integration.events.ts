export interface IntegrationEvent {
    id: string;
    type: "integration.created" | "integration.updated" | "integration.deleted" |
        "connection.status_changed" | "sync.started" | "sync.completed" | "sync.failed";
    integrationId: string;
    timestamp: string;
    payload: Record<string, unknown>;
}
