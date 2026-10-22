import { createDomainControllers } from "./controller-factory.js";
import type { ControllerOperations } from "./controller-factory.js";

/** Configure model operations with validated schemas and real services. */
export function createModelControllers(operations: ControllerOperations) {
  return createDomainControllers("model", operations);
}
