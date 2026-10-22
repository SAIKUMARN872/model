import { createDomainControllers } from "./controller-factory.js";
import type { ControllerOperations } from "./controller-factory.js";

/** Configure file operations with validated schemas and real services. */
export function createFileControllers(operations: ControllerOperations) {
  return createDomainControllers("file", operations);
}
