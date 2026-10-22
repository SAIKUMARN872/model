import { createDomainControllers } from "./controller-factory.js";
import type { ControllerOperations } from "./controller-factory.js";

/** Configure execution operations with validated schemas and real services. */
export function createExecutionControllers(operations: ControllerOperations) {
  return createDomainControllers("execution", operations);
}
