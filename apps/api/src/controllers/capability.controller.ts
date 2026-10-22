import { createDomainControllers } from "./controller-factory.js";
import type { ControllerOperations } from "./controller-factory.js";

/** Configure capability operations with validated schemas and real services. */
export function createCapabilityControllers(operations: ControllerOperations) {
  return createDomainControllers("capability", operations);
}
