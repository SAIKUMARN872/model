import { createDomainControllers } from "./controller-factory.js";
import type { ControllerOperations } from "./controller-factory.js";

/** Configure multimodal operations with validated schemas and real services. */
export function createMultimodalControllers(operations: ControllerOperations) {
  return createDomainControllers("multimodal", operations);
}
