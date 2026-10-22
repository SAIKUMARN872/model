import { createDomainControllers } from "./controller-factory.js";
import type { ControllerOperations } from "./controller-factory.js";

/** Configure automation operations with validated schemas and real services. */
export function createAutomationControllers(operations: ControllerOperations) {
  return createDomainControllers("automation", operations);
}
