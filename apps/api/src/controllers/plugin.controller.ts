import { createDomainControllers } from "./controller-factory.js";
import type { ControllerOperations } from "./controller-factory.js";

/** Configure plugin operations with validated schemas and real services. */
export function createPluginControllers(operations: ControllerOperations) {
  return createDomainControllers("plugin", operations);
}
