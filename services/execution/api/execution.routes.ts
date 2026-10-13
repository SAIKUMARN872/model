import type { ExecutionController, ExecutionRequest } from "./execution.controller.js";

export interface ExecutionRoute {
  method: "GET" | "POST" | "DELETE";
  path: string;
  handler: (request: ExecutionRequest) => Promise<unknown>;
}

export function createExecutionRoutes(
  controller: ExecutionController
): ExecutionRoute[] {
  return [
    {
      method: "POST",
      path: "/executions",
      handler: (request) => controller.create(request)
    },
    {
      method: "GET",
      path: "/executions",
      handler: (request) => controller.list(request)
    },
    {
      method: "GET",
      path: "/executions/:id",
      handler: (request) => controller.get(request)
    },
    {
      method: "POST",
      path: "/executions/:id/cancel",
      handler: (request) => controller.cancel(request)
    },
    {
      method: "POST",
      path: "/executions/:id/retry",
      handler: (request) => controller.retry(request)
    }
  ];
}
