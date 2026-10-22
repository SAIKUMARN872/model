import { createDomainControllers } from "./controller-factory.js";
import type { ControllerOperations } from "./controller-factory.js";

/** Configure computer-use operations with validated schemas and real services. */
export function createComputerUseControllers(operations: ControllerOperations) {
  return createDomainControllers("computer-use", operations);
}
