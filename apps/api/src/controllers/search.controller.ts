import { createDomainControllers } from "./controller-factory.js";
import type { ControllerOperations } from "./controller-factory.js";

/** Configure search operations with validated schemas and real services. */
export function createSearchControllers(operations: ControllerOperations) {
  return createDomainControllers("search", operations);
}
