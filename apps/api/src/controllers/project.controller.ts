import { createDomainControllers } from "./controller-factory.js";
import type { ControllerOperations } from "./controller-factory.js";

/** Configure project operations with validated schemas and real services. */
export function createProjectControllers(operations: ControllerOperations) {
  return createDomainControllers("project", operations);
}
