import { createDomainControllers } from "./controller-factory.js";
import type { ControllerOperations } from "./controller-factory.js";

/** Configure conversation operations with validated schemas and real services. */
export function createConversationControllers(operations: ControllerOperations) {
  return createDomainControllers("conversation", operations);
}
