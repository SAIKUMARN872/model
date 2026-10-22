import { createDomainControllers } from "./controller-factory.js";
import type { ControllerOperations } from "./controller-factory.js";

/** Configure usage operations with validated schemas and real services. */
export function createUsageControllers(operations: ControllerOperations) {
  return createDomainControllers("usage", operations);
}
