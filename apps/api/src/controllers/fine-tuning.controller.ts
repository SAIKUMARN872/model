import { createDomainControllers } from "./controller-factory.js";
import type { ControllerOperations } from "./controller-factory.js";

/** Configure fine-tuning operations with validated schemas and real services. */
export function createFineTuningControllers(operations: ControllerOperations) {
  return createDomainControllers("fine-tuning", operations);
}
