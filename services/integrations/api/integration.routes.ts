import type { IntegrationController } from "./integration.controller.js";

export interface IntegrationRoute {
    method: "GET" | "POST" | "PATCH" | "DELETE";
    path: string;
    handler: (params?: Record<string, string>, body?: Record<string, unknown>) => unknown;
}

export function createIntegrationRoutes(controller: IntegrationController): IntegrationRoute[] {
    return [
        { method: "GET", path: "/integrations", handler: () => controller.listIntegrations() },
        { method: "POST", path: "/integrations", handler: (_params, body) => controller.createIntegration((body ?? {}) as never) },
        { method: "GET", path: "/integrations/:id", handler: (params) => controller.getIntegration(params?.id ?? "") },
        { method: "DELETE", path: "/integrations/:id", handler: (params) => controller.deleteIntegration(params?.id ?? "") },
        { method: "GET", path: "/connections", handler: (params) => controller.listConnections(params?.integrationId) },
        { method: "POST", path: "/connections", handler: (_params, body) => controller.createConnection((body ?? {}) as never) },
        { method: "POST", path: "/credentials", handler: (_params, body) => controller.createCredential((body ?? {}) as never) },
        { method: "POST", path: "/sync", handler: (_params, body) => controller.enqueueSync((body ?? {}) as never) },
        { method: "GET", path: "/sync/:id", handler: (params) => controller.getSyncJob(params?.id ?? "") }
    ];
}
