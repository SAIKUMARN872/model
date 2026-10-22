import { createDomainControllers } from "./controller-factory.js";
import type { ControllerOperations } from "./controller-factory.js";

/** Configure knowledge operations with validated schemas and real services. */
export function createKnowledgeControllers(operations: ControllerOperations) {
  return createDomainControllers("knowledge", operations);
}
